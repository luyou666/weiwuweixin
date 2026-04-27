import{j as a,a as e,m as v}from"./proxy-RWgpSLFb.js";import{r as j}from"./index-BwDkhjyp.js";import"./_commonjsHelpers-BosuxZz1.js";const J={sm:{dimension:56,fontSize:"var(--text-xs)",ringWidth:3},md:{dimension:80,fontSize:"var(--text-sm)",ringWidth:4},lg:{dimension:112,fontSize:"var(--text-base)",ringWidth:5}};function h({size:n,color:o}){const r=n/2-6,p=`${r*.15} ${r*.08} ${r*.12} ${r*.08}`;return a("svg",{width:n,height:n,viewBox:`0 0 ${n} ${n}`,className:"absolute inset-0","aria-hidden":"true",children:[e("circle",{cx:n/2,cy:n/2,r,fill:"none",stroke:o,strokeWidth:"1",opacity:"0.3"}),e("circle",{cx:n/2,cy:n/2,r:r-2,fill:"none",stroke:o,strokeWidth:"0.8",strokeDasharray:p,opacity:"0.4"}),e("circle",{cx:n/2,cy:n/2,r:r-8,fill:"none",stroke:o,strokeWidth:"0.5",strokeDasharray:`${r*.1} ${r*.05}`,opacity:"0.25"}),[[n/2,n/2-r+4],[n/2+r-4,n/2],[n/2,n/2+r-4],[n/2-r+4,n/2]].map(([m,f],x)=>e("rect",{x:m-2,y:f-1,width:"4",height:"2",fill:o,opacity:"0.5"},x))]})}function K(n){return n<.3?"var(--ink-300)":n<.6?"var(--celadon)":"var(--vermilion)"}const i=j.forwardRef(({confidence:n,size:o="md",label:r,spinning:p=!0,spinDuration:m=20,lowText:f="存疑",highText:x="确然",className:L="",...G},O)=>{const t=J[o],u=K(n),R=Math.round(n*100),P=r??(n<.5?f:x),y=t.dimension/2-t.ringWidth,g=2*Math.PI*y,H=g*(1-n);return a("div",{ref:O,className:["weiwu-confidence-seal","relative inline-flex items-center justify-center",L].filter(Boolean).join(" "),style:{width:t.dimension,height:t.dimension,fontFamily:"var(--font-heading)"},...G,children:[p?e(v.div,{className:"absolute inset-0",animate:{rotate:360},transition:{duration:m,repeat:1/0,ease:"linear"},children:e(h,{size:t.dimension,color:u})}):e("div",{className:"absolute inset-0",children:e(h,{size:t.dimension,color:u})}),a("svg",{className:"absolute inset-0",width:t.dimension,height:t.dimension,viewBox:`0 0 ${t.dimension} ${t.dimension}`,"aria-hidden":"true",children:[e("circle",{cx:t.dimension/2,cy:t.dimension/2,r:y,fill:"none",stroke:"var(--color-border)",strokeWidth:t.ringWidth,strokeLinecap:"round",opacity:"0.4"}),e("circle",{cx:t.dimension/2,cy:t.dimension/2,r:y,fill:"none",stroke:u,strokeWidth:t.ringWidth,strokeLinecap:"round",strokeDasharray:g,strokeDashoffset:H,transform:`rotate(-90 ${t.dimension/2} ${t.dimension/2})`,style:{transition:"stroke-dashoffset 0.6s var(--ease-out)"}})]}),a(v.div,{className:"relative z-10 flex flex-col items-center justify-center",initial:{scale:.8,opacity:0},animate:{scale:1,opacity:1},transition:{type:"spring",stiffness:300,damping:18},children:[a("span",{className:"font-bold leading-none",style:{fontSize:t.fontSize,color:u},children:[R,e("span",{className:"text-[0.6em] opacity-70",children:"%"})]}),e("span",{className:"text-[0.5em] mt-0.5 opacity-70 tracking-wider",style:{fontSize:t.fontSize,color:"var(--color-text-secondary)"},children:P})]}),e("div",{className:"pointer-events-none absolute inset-0 rounded-full seal-texture","aria-hidden":"true"})]})});i.displayName="ConfidenceSeal";try{i.displayName="ConfidenceSeal",i.__docgenInfo={description:`圆形印章置信度徽标
外圈缓慢旋转篆刻纹样SVG`,displayName:"ConfidenceSeal",props:{confidence:{defaultValue:null,description:"置信度 0-1",name:"confidence",required:!0,type:{name:"number"}},size:{defaultValue:{value:"md"},description:"尺寸",name:"size",required:!1,type:{name:"enum",value:[{value:'"sm"'},{value:'"md"'},{value:'"lg"'}]}},label:{defaultValue:null,description:"印章文字",name:"label",required:!1,type:{name:"string"}},spinning:{defaultValue:{value:"true"},description:"外圈是否旋转",name:"spinning",required:!1,type:{name:"boolean"}},spinDuration:{defaultValue:{value:"20"},description:"旋转速度（秒/圈）",name:"spinDuration",required:!1,type:{name:"number"}},lowText:{defaultValue:{value:"存疑"},description:"低置信度提示文案",name:"lowText",required:!1,type:{name:"string"}},highText:{defaultValue:{value:"确然"},description:"高置信度提示文案",name:"highText",required:!1,type:{name:"string"}}}}}catch{}const Y={title:"组件/ConfidenceSeal 置信度印章",component:i,tags:["autodocs"],argTypes:{confidence:{control:{type:"number",min:0,max:1,step:.01},description:"置信度（0~1）"},size:{control:"select",options:["sm","md","lg"],description:"印章尺寸"},label:{control:"text",description:"自定义标签文字"},spinning:{control:"boolean",description:"外圈篆刻纹样是否旋转"},spinDuration:{control:{type:"number",min:5,max:60,step:1},description:"旋转一圈秒数"},lowText:{control:"text",description:"低置信度（<0.5）文案"},highText:{control:"text",description:"高置信度（≥0.5）文案"}},args:{confidence:.75,size:"md",spinning:!0,spinDuration:20,lowText:"存疑",highText:"确然"}},s={args:{confidence:.75}},l={render:()=>a("div",{style:{display:"flex",flexDirection:"column",gap:"var(--space-2xl)"},children:[e("h3",{style:{fontFamily:"var(--font-heading)",color:"var(--color-text-primary)"},children:"置信度级别"}),a("div",{style:{display:"flex",gap:"var(--space-xl)",alignItems:"center",flexWrap:"wrap"},children:[a("div",{style:{textAlign:"center"},children:[e(i,{confidence:.15}),e("p",{style:{marginTop:"8px",fontSize:"var(--text-xs)",color:"var(--color-text-muted)"},children:"低 — 15%"})]}),a("div",{style:{textAlign:"center"},children:[e(i,{confidence:.45}),e("p",{style:{marginTop:"8px",fontSize:"var(--text-xs)",color:"var(--color-text-muted)"},children:"中低 — 45%"})]}),a("div",{style:{textAlign:"center"},children:[e(i,{confidence:.75}),e("p",{style:{marginTop:"8px",fontSize:"var(--text-xs)",color:"var(--color-text-muted)"},children:"高 — 75%"})]}),a("div",{style:{textAlign:"center"},children:[e(i,{confidence:.95}),e("p",{style:{marginTop:"8px",fontSize:"var(--text-xs)",color:"var(--color-text-muted)"},children:"极高 — 95%"})]})]}),e("h3",{style:{fontFamily:"var(--font-heading)",color:"var(--color-text-primary)"},children:"尺寸"}),a("div",{style:{display:"flex",gap:"var(--space-lg)",alignItems:"center"},children:[e(i,{confidence:.7,size:"sm"}),e(i,{confidence:.7,size:"md"}),e(i,{confidence:.7,size:"lg"})]}),e("h3",{style:{fontFamily:"var(--font-heading)",color:"var(--color-text-primary)"},children:"静态（无旋转）"}),e(i,{confidence:.8,spinning:!1}),e("h3",{style:{fontFamily:"var(--font-heading)",color:"var(--color-text-primary)"},children:"自定义文案"}),a("div",{style:{display:"flex",gap:"var(--space-lg)",alignItems:"center"},children:[e(i,{confidence:.3,lowText:"疑",highText:"信"}),e(i,{confidence:.9,lowText:"疑",highText:"信"})]})]})},c={render:()=>{const[n,o]=j.useState(.75);return a("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"var(--space-lg)"},children:[e(i,{confidence:n}),a("label",{style:{display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"},children:[a("span",{style:{fontSize:"var(--text-sm)",color:"var(--color-text-secondary)"},children:["置信度：",Math.round(n*100),"%"]}),e("input",{type:"range",min:0,max:1,step:.01,value:n,onChange:r=>o(Number(r.target.value)),style:{width:200}})]})]})}},d={parameters:{darkMode:!0},render:()=>a("div",{style:{display:"flex",gap:"var(--space-xl)",alignItems:"center"},children:[e(i,{confidence:.3,size:"sm"}),e(i,{confidence:.7,size:"md"}),e(i,{confidence:.95,size:"lg"})]})};var F,E,S,C,A;s.parameters={...s.parameters,docs:{...(F=s.parameters)==null?void 0:F.docs,source:{originalSource:`{
  args: {
    confidence: 0.75
  }
}`,...(S=(E=s.parameters)==null?void 0:E.docs)==null?void 0:S.source},description:{story:"默认置信度印章 — 75% 置信度 + 篆刻纹样旋转",...(A=(C=s.parameters)==null?void 0:C.docs)==null?void 0:A.description}}};var D,T,B,b,k;l.parameters={...l.parameters,docs:{...(D=l.parameters)==null?void 0:D.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2xl)'
  }}>
      <h3 style={{
      fontFamily: 'var(--font-heading)',
      color: 'var(--color-text-primary)'
    }}>置信度级别</h3>
      <div style={{
      display: 'flex',
      gap: 'var(--space-xl)',
      alignItems: 'center',
      flexWrap: 'wrap'
    }}>
        <div style={{
        textAlign: 'center'
      }}>
          <ConfidenceSeal confidence={0.15} />
          <p style={{
          marginTop: '8px',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)'
        }}>低 — 15%</p>
        </div>
        <div style={{
        textAlign: 'center'
      }}>
          <ConfidenceSeal confidence={0.45} />
          <p style={{
          marginTop: '8px',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)'
        }}>中低 — 45%</p>
        </div>
        <div style={{
        textAlign: 'center'
      }}>
          <ConfidenceSeal confidence={0.75} />
          <p style={{
          marginTop: '8px',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)'
        }}>高 — 75%</p>
        </div>
        <div style={{
        textAlign: 'center'
      }}>
          <ConfidenceSeal confidence={0.95} />
          <p style={{
          marginTop: '8px',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)'
        }}>极高 — 95%</p>
        </div>
      </div>

      <h3 style={{
      fontFamily: 'var(--font-heading)',
      color: 'var(--color-text-primary)'
    }}>尺寸</h3>
      <div style={{
      display: 'flex',
      gap: 'var(--space-lg)',
      alignItems: 'center'
    }}>
        <ConfidenceSeal confidence={0.7} size="sm" />
        <ConfidenceSeal confidence={0.7} size="md" />
        <ConfidenceSeal confidence={0.7} size="lg" />
      </div>

      <h3 style={{
      fontFamily: 'var(--font-heading)',
      color: 'var(--color-text-primary)'
    }}>静态（无旋转）</h3>
      <ConfidenceSeal confidence={0.8} spinning={false} />

      <h3 style={{
      fontFamily: 'var(--font-heading)',
      color: 'var(--color-text-primary)'
    }}>自定义文案</h3>
      <div style={{
      display: 'flex',
      gap: 'var(--space-lg)',
      alignItems: 'center'
    }}>
        <ConfidenceSeal confidence={0.3} lowText="疑" highText="信" />
        <ConfidenceSeal confidence={0.9} lowText="疑" highText="信" />
      </div>
    </div>
}`,...(B=(T=l.parameters)==null?void 0:T.docs)==null?void 0:B.source},description:{story:"所有置信度级别",...(k=(b=l.parameters)==null?void 0:b.docs)==null?void 0:k.description}}};var w,z,I,N,W;c.parameters={...c.parameters,docs:{...(w=c.parameters)==null?void 0:w.docs,source:{originalSource:`{
  render: () => {
    const [confidence, setConfidence] = useState(0.75);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 'var(--space-lg)'
    }}>
        <ConfidenceSeal confidence={confidence} />
        <label style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px'
      }}>
          <span style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-secondary)'
        }}>
            置信度：{Math.round(confidence * 100)}%
          </span>
          <input type="range" min={0} max={1} step={0.01} value={confidence} onChange={e => setConfidence(Number(e.target.value))} style={{
          width: 200
        }} />
        </label>
      </div>;
  }
}`,...(I=(z=c.parameters)==null?void 0:z.docs)==null?void 0:I.source},description:{story:"可交互的置信度印章 — 通过 Controls 面板调整置信度",...(W=(N=c.parameters)==null?void 0:N.docs)==null?void 0:W.description}}};var $,V,_,M,q;d.parameters={...d.parameters,docs:{...($=d.parameters)==null?void 0:$.docs,source:{originalSource:`{
  parameters: {
    darkMode: true
  },
  render: () => <div style={{
    display: 'flex',
    gap: 'var(--space-xl)',
    alignItems: 'center'
  }}>
      <ConfidenceSeal confidence={0.3} size="sm" />
      <ConfidenceSeal confidence={0.7} size="md" />
      <ConfidenceSeal confidence={0.95} size="lg" />
    </div>
}`,...(_=(V=d.parameters)==null?void 0:V.docs)==null?void 0:_.source},description:{story:"暗色模式下的置信度印章",...(q=(M=d.parameters)==null?void 0:M.docs)==null?void 0:q.description}}};const Z=["Default","Variants","Interactive","DarkMode"];export{d as DarkMode,s as Default,c as Interactive,l as Variants,Z as __namedExportsOrder,Y as default};
