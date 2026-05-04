#!/usr/bin/env python3
"""WeiWuWeiXin — 可靠启动 v4
修复: socket bind实测端口 + setsid进程隔离 + 重试机制
"""
import os, subprocess, time, sys, socket, signal, secrets

PROJ = '/home/zhuwankai/weiwuweixin'
LOG = f'{PROJ}/scripts/logs'
os.makedirs(LOG, exist_ok=True)

def _real_port_busy(port):
    """用实际 socket connect 测试端口 — 不依赖 ss/lsof"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(0.5)
        s.connect(('127.0.0.1', port))
        s.close()
        return True
    except (ConnectionRefusedError, TimeoutError, OSError):
        return False

def kill_port(port, max_attempts=15):
    """循环清端口直到实际bind测试空闲"""
    for _ in range(max_attempts):
        subprocess.run(['fuser', '-k', f'{port}/tcp'], capture_output=True)
        time.sleep(0.3)
        if not _real_port_busy(port):
            return True
    return False

def wait_http(url, timeout=30):
    for i in range(timeout):
        r = subprocess.run(
            ['curl', '-sSo', '/dev/null', '-w', '%{http_code}',
             '--max-time', '2', url],
            capture_output=True, text=True)
        code = r.stdout.strip()
        if code in ('200', '307', '308', '304'):
            return i + 1
        time.sleep(1)
    return None

# ── Banner ──
print("""
\033[1m============================================\033[0m
\033[1m  WeiWuWeiXin — Starting v4\033[0m
\033[1m============================================\033[0m
""")

# ── 0. 暴力清场 ──
print("\033[33m[0] Cleaning old processes...\033[0m")
for proc in ['postgres', 'next.*dev', 'tsx', 'tsup', 'esbuild']:
    subprocess.run(['pkill', '-9', '-f', proc], capture_output=True)
time.sleep(0.5)

for port in [5432, 3002, 3001, 6379]:
    ok = kill_port(port, max_attempts=10)
    print(f"  Port {port}: {'\033[32mFREE\033[0m' if ok else '\033[33mFORCE\033[0m'}")

subprocess.run(['rm', '-f', f'{PROJ}/.pg-port', f'{PROJ}/data/pg/postmaster.pid'])

# ── Ensure .env ──
env_file = f'{PROJ}/apps/api/.env'
if not os.path.exists(env_file):
    print("\033[33mCreating .env...\033[0m")
    if os.path.exists(f'{PROJ}/.env.example'):
        with open(f'{PROJ}/.env.example') as f:
            env = f.read()
    else:
        env = ""
    env = env.replace('JWT_SECRET=changeme', f'JWT_SECRET={secrets.token_hex(32)}')
    env = env.replace('PG_PASSWORD=changeme', 'PG_PASSWORD=weiwuweixin_dev')
    env = env.replace('changeme@localhost', 'weiwuweixin_dev@localhost')
    with open(env_file, 'w') as f:
        f.write(env)
    print("  \033[32mOK\033[0m")

os.environ['PG_PASSWORD'] = os.environ.get('PG_PASSWORD', 'weiwuweixin_dev')

# ── 1. PostgreSQL ──
print("\033[34m[1/4] PostgreSQL\033[0m")
pg = subprocess.Popen(['node', 'packages/shared/start-pg.cjs'], cwd=PROJ,
                       stdout=open(f'{LOG}/pg.log', 'w'), stderr=subprocess.STDOUT)

for i in range(25):
    if os.path.exists(f'{PROJ}/.pg-port'):
        print(f"  \033[32mOK ({i+1}s)\033[0m")
        break
    if pg.poll() is not None:
        print(f"  \033[31mFAILED\033[0m")
        os.system(f'tail -20 {LOG}/pg.log')
        sys.exit(1)
    time.sleep(1)
else:
    print("  \033[31mTIMEOUT\033[0m")
    sys.exit(1)

# ── 2. DB Schema ──
print("\033[34m[2/4] DB Schema\033[0m")
r = subprocess.run(['npx', 'prisma', 'db', 'push', '--skip-generate'],
                   cwd=f'{PROJ}/apps/api', capture_output=True)
if r.returncode == 0:
    print("  \033[32mOK\033[0m")
else:
    subprocess.run(['npx', 'prisma', 'generate'], cwd=f'{PROJ}/apps/api', capture_output=True)
    r2 = subprocess.run(['npx', 'prisma', 'db', 'push'], cwd=f'{PROJ}/apps/api', capture_output=True)
    print(f"  {'\033[32mOK\033[0m' if r2.returncode == 0 else '\033[33mSkip\033[0m'}")

# ── 3. Redis ──
print("\033[34m[3/4] Redis\033[0m")
redis_bin = None
for path in ['redis-server', os.path.expanduser('~/.local/bin/redis-server'), '/usr/bin/redis-server']:
    r = subprocess.run(['which', path], capture_output=True)
    if r.returncode == 0:
        redis_bin = path
        break

if redis_bin:
    r = subprocess.run(['redis-cli', 'ping'], capture_output=True)
    if r.returncode == 0:
        print("  \033[32mAlready running\033[0m")
    else:
        kill_port(6379, 5)
        r = subprocess.run([redis_bin, '--daemonize', 'yes', '--port', '6379'], capture_output=True)
        print(f"  {'\033[32mOK\033[0m' if r.returncode == 0 else '\033[33mSkip\033[0m'}")
else:
    print("  \033[33mSkip (degraded)\033[0m")

# ═══ 4. 顺序启动 API → Web ═══
print("\033[34m[4] Starting servers...\033[0m")

# ── 4a. API — setsid 隔离进程组 ──
print("  [4a] API :3001 ... ", end='', flush=True)
kill_port(3001, 10)

# 用 setsid 创建新会话，避免子进程逃逸
os.environ['HOST'] = '127.0.0.1'
os.environ['PORT'] = '3001'
api_proc = subprocess.Popen(
    ['setsid', 'npx', 'tsx', 'src/index.ts'],
    cwd=f'{PROJ}/apps/api',
    stdout=open(f'{LOG}/api.log', 'w'),
    stderr=subprocess.STDOUT,
    preexec_fn=os.setpgrp  # 创建新进程组
)

t = wait_http('http://127.0.0.1:3001/health', 25)
if t:
    print(f"\033[32mOK ({t}s)\033[0m")
else:
    print("\033[31mFAILED\033[0m")
    sys.exit(1)

# ── 4b. Web — 真端口空闲确认 + 重试 ──
print("  [4b] Web :3002 ... ", end='', flush=True)

# 循环确认端口真正空闲
for attempt in range(10):
    kill_port(3002, 15)
    time.sleep(0.5)
    if not _real_port_busy(3002):
        break
    print(f"\n  Retry {attempt+1}: port 3002 still busy", end='', flush=True)
    time.sleep(1)

if _real_port_busy(3002):
    print(f"\n  \033[31mFAILED: port 3002 stuck after 10 retries\033[0m")
    sys.exit(1)

os.environ['HOSTNAME'] = '127.0.0.1'
web_proc = subprocess.Popen(
    ['setsid', 'npx', 'next', 'dev', '-p', '3002', '-H', '127.0.0.1', f'{PROJ}/apps/web'],
    cwd=PROJ,
    stdout=open(f'{LOG}/web.log', 'w'),
    stderr=subprocess.STDOUT,
    preexec_fn=os.setpgrp
)

# 等待 Web 就绪，如果挂了就重试
web_ok = False
for i in range(45):
    t = wait_http('http://127.0.0.1:3002', 1)  # 每次等1秒
    if t:
        web_ok = True
        print(f"\033[32mOK ({i+1}s)\033[0m")
        break

    if web_proc.poll() is not None:
        # 进程挂了——多半端口被抢，重试
        print(f"\n  Web died (EADDRINUSE?), retrying...", end='', flush=True)
        kill_port(3002, 20)
        time.sleep(1)
        if not _real_port_busy(3002):
            web_proc = subprocess.Popen(
                ['setsid', 'npx', 'next', 'dev', '-p', '3002', '-H', '127.0.0.1', f'{PROJ}/apps/web'],
                cwd=PROJ,
                stdout=open(f'{LOG}/web.log', 'w'),
                stderr=subprocess.STDOUT,
                preexec_fn=os.setpgrp
            )
        else:
            print(f"\n  \033[31mFAILED: port stuck after restart attempt\033[0m")
            sys.exit(1)

    time.sleep(1)

if not web_ok:
    print(f"\033[33mSlow (still compiling)\033[0m")

# ── 完成，打开浏览器 ──
print("")
for cmd in ['xdg-open', 'open', 'sensible-browser']:
    r = subprocess.run(['which', cmd], capture_output=True)
    if r.returncode == 0:
        subprocess.Popen([cmd, 'http://localhost:3002/zh/'])

print(f"""
\033[32m============================================\033[0m
\033[32m  WeiWuWeiXin is running!\033[0m
\033[32m============================================\033[0m

  \033[1mWeb:\033[0m  \033[34mhttp://localhost:3002/zh/\033[0m
  \033[1mAPI:\033[0m  \033[34mhttp://localhost:3001\033[0m

  \033[33mCtrl+C to stop\033[0m
""")

# Keep running
try:
    api_proc.wait()
except KeyboardInterrupt:
    pass
finally:
    print("\n\033[33mStopping...\033[0m")
    for proc in [web_proc, api_proc, pg]:
        try:
            proc.terminate()
            proc.wait(timeout=3)
        except:
            try:
                proc.kill()
            except:
                pass
    for port in [5432, 3002, 3001, 6379]:
        subprocess.run(['fuser', '-k', f'{port}/tcp'], capture_output=True)
    print("\033[32mBye!\033[0m")
