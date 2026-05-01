import shutil, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
shutil.rmtree('.next', ignore_errors=True)
print('removed .next' if not os.path.exists('.next') else '.next still exists')