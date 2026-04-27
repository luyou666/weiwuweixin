import{M as oe,a as e,u as ae,P as se,b as ue,c as ie,L as le,F as ce,j as y,m as N}from"./proxy-RWgpSLFb.js";import{r as t}from"./index-BwDkhjyp.js";import"./_commonjsHelpers-BosuxZz1.js";class de extends t.Component{getSnapshotBeforeUpdate(r){const a=this.props.childRef.current;if(a&&r.isPresent&&!this.props.isPresent){const o=this.props.sizeRef.current;o.height=a.offsetHeight||0,o.width=a.offsetWidth||0,o.top=a.offsetTop,o.left=a.offsetLeft}return null}componentDidUpdate(){}render(){return this.props.children}}function pe({children:n,isPresent:r}){const a=t.useId(),o=t.useRef(null),g=t.useRef({width:0,height:0,top:0,left:0}),{nonce:d}=t.useContext(oe);return t.useInsertionEffect(()=>{const{width:p,height:u,top:C,left:s}=g.current;if(r||!o.current||!p||!u)return;o.current.dataset.motionPopId=a;const i=document.createElement("style");return d&&(i.nonce=d),document.head.appendChild(i),i.sheet&&i.sheet.insertRule(`
          [data-motion-pop-id="${a}"] {
            position: absolute !important;
            width: ${p}px !important;
            height: ${u}px !important;
            top: ${C}px !important;
            left: ${s}px !important;
          }
        `),()=>{document.head.removeChild(i)}},[r]),e(de,{isPresent:r,childRef:o,sizeRef:g,children:t.cloneElement(n,{ref:o})})}const fe=({children:n,initial:r,isPresent:a,onExitComplete:o,custom:g,presenceAffectsLayout:d,mode:p})=>{const u=ae(me),C=t.useId(),s=t.useCallback(x=>{u.set(x,!0);for(const F of u.values())if(!F)return;o&&o()},[u,o]),i=t.useMemo(()=>({id:C,initial:r,isPresent:a,custom:g,onExitComplete:s,register:x=>(u.set(x,!1),()=>u.delete(x))}),d?[Math.random(),s]:[a,s]);return t.useMemo(()=>{u.forEach((x,F)=>u.set(F,!1))},[a]),t.useEffect(()=>{!a&&!u.size&&o&&o()},[a]),p==="popLayout"&&(n=e(pe,{isPresent:a,children:n})),e(se.Provider,{value:i,children:n})};function me(){return new Map}const B=n=>n.key||"";function $(n){const r=[];return t.Children.forEach(n,a=>{t.isValidElement(a)&&r.push(a)}),r}const L=({children:n,custom:r,initial:a=!0,onExitComplete:o,presenceAffectsLayout:g=!0,mode:d="sync",propagate:p=!1})=>{const[u,C]=ue(p),s=t.useMemo(()=>$(n),[n]),i=p&&!u?[]:s.map(B),x=t.useRef(!0),F=t.useRef(s),m=ae(()=>new Map),[E,h]=t.useState(s),[v,b]=t.useState(s);ie(()=>{x.current=!1,F.current=s;for(let f=0;f<v.length;f++){const c=B(v[f]);i.includes(c)?m.delete(c):m.get(c)!==!0&&m.set(c,!1)}},[v,i.length,i.join("-")]);const z=[];if(s!==E){let f=[...s];for(let c=0;c<v.length;c++){const S=v[c],M=B(S);i.includes(M)||(f.splice(c,0,S),z.push(S))}d==="wait"&&z.length&&(f=z),b($(f)),h(s);return}const{forceRender:w}=t.useContext(le);return e(ce,{children:v.map(f=>{const c=B(f),S=p&&!u?!1:s===v||i.includes(c),M=()=>{if(m.has(c))m.set(c,!0);else return;let R=!0;m.forEach(re=>{re||(R=!1)}),R&&(w==null||w(),b(F.current),p&&(C==null||C()),o&&o())};return e(fe,{isPresent:S,initial:!x.current||a?void 0:!1,custom:S?void 0:r,presenceAffectsLayout:g,mode:d,onExitComplete:S?void 0:M,children:f},c)})})},he={sm:{trackHeight:4,thumbSize:16,fontSize:"var(--text-xs)"},md:{trackHeight:6,thumbSize:20,fontSize:"var(--text-sm)"},lg:{trackHeight:8,thumbSize:24,fontSize:"var(--text-base)"}};function ve(){return e("svg",{className:"absolute w-0 h-0","aria-hidden":"true",children:y("defs",{children:[y("filter",{id:"ink-drop-filter",x:"-50%",y:"-50%",width:"200%",height:"200%",children:[e("feTurbulence",{type:"fractalNoise",baseFrequency:"0.03",numOctaves:"4",seed:"2",result:"noise"}),e("feDisplacementMap",{in:"SourceGraphic",in2:"noise",scale:"6",xChannelSelector:"R",yChannelSelector:"G"}),e("feGaussianBlur",{stdDeviation:"1.5"})]}),y("radialGradient",{id:"ink-grad",cx:"50%",cy:"50%",r:"50%",children:[e("stop",{offset:"0%",stopColor:"var(--vermilion)",stopOpacity:"1"}),e("stop",{offset:"70%",stopColor:"var(--vermilion)",stopOpacity:"0.6"}),e("stop",{offset:"100%",stopColor:"var(--vermilion)",stopOpacity:"0"})]})]})})}const l=t.forwardRef(({value:n,min:r=0,max:a=100,step:o=1,size:g="md",onChange:d,showLabel:p=!0,inkEffect:u=!0,disabled:C=!1,accentColor:s,className:i="",...x},F)=>{const[m,E]=t.useState(!1),h=he[g],v=(n-r)/(a-r)*100,b=s||"var(--vermilion)",z=t.useCallback(w=>{const f=Number(w.target.value);d(f)},[d]);return y("div",{className:`weiwu-slider relative flex flex-col items-center gap-1 w-full ${C?"opacity-40 cursor-not-allowed":""} ${i}`,style:{fontFamily:"var(--font-body)"},children:[e(ve,{}),y("div",{className:"relative flex-1 flex items-center w-full",style:{height:h.thumbSize+8},children:[e(L,{children:p&&m&&y(N.div,{initial:{opacity:0,y:8},animate:{opacity:1,y:0},exit:{opacity:0,y:8},transition:{type:"spring",stiffness:400,damping:22},className:"absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-[var(--radius-sm)] text-[var(--text-xs)] font-[var(--font-mono)]",style:{background:"var(--ink-900)",color:"var(--paper)",fontSize:h.fontSize},children:[n,e("span",{className:"absolute -bottom-1 left-1/2 -translate-x-1/2",style:{width:0,height:0,borderLeft:"4px solid transparent",borderRight:"4px solid transparent",borderTop:"4px solid var(--ink-900)"}})]})}),y("div",{className:"relative w-full rounded-[var(--radius-pill)] bg-[var(--rice)]",style:{height:h.trackHeight},children:[e("div",{className:"absolute top-0 left-0 h-full rounded-[var(--radius-pill)] transition-all duration-[var(--duration-fast)]",style:{width:`${v}%`,background:b}}),e(L,{children:u&&m&&e(N.div,{initial:{scale:.3,opacity:.8},animate:{scale:2.5,opacity:0},exit:{opacity:0},transition:{duration:1.2,ease:"easeOut"},className:"absolute top-1/2 -translate-y-1/2 pointer-events-none",style:{left:`${v}%`,width:h.thumbSize*1.5,height:h.thumbSize*1.5,marginLeft:-(h.thumbSize*.75),borderRadius:"50%",background:`radial-gradient(circle, ${b}66 0%, transparent 70%)`}})})]}),e("input",{ref:F,type:"range",min:r,max:a,step:o,value:n,disabled:C,onChange:z,onMouseDown:()=>E(!0),onMouseUp:()=>E(!1),onTouchStart:()=>E(!0),onTouchEnd:()=>E(!1),className:"absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"}),e(N.div,{className:"pointer-events-none absolute top-1/2 -translate-y-1/2 z-20",style:{left:`calc(${v}% - ${h.thumbSize/2}px)`,width:h.thumbSize,height:h.thumbSize},animate:m?{scale:1.2}:{scale:1},transition:{type:"spring",stiffness:400,damping:17},children:e("div",{className:"w-full h-full rounded-full border-2 border-[var(--paper)]",style:{background:b,boxShadow:m?`0 0 0 4px ${b}33, var(--shadow-md)`:"var(--shadow-sm)",transition:"box-shadow var(--duration-fast) var(--ease-out)"}})})]}),p&&y("div",{className:"flex justify-between w-full text-[var(--text-xs)] text-[var(--color-text-muted)] mt-0.5 px-0.5",children:[e("span",{children:r}),e("span",{children:a})]})]})});l.displayName="Slider";try{l.displayName="Slider",l.__docgenInfo={description:`评分滑杆 — 滑动时墨滴晕开效果

暗色适配：
  - 轨道背景使用 --rice（暗色下已是深色）
  - 拇指边框使用 --paper（暗色下是深底色）
  - 标签气泡使用 --ink-900 和 --paper（暗色下自动反转）
  - 所有颜色通过 CSS 变量驱动`,displayName:"Slider",props:{value:{defaultValue:null,description:"当前值",name:"value",required:!0,type:{name:"number"}},min:{defaultValue:{value:"0"},description:"最小值",name:"min",required:!1,type:{name:"number"}},max:{defaultValue:{value:"100"},description:"最大值",name:"max",required:!1,type:{name:"number"}},step:{defaultValue:{value:"1"},description:"步长",name:"step",required:!1,type:{name:"number"}},size:{defaultValue:{value:"md"},description:"尺寸",name:"size",required:!1,type:{name:"enum",value:[{value:'"sm"'},{value:'"md"'},{value:'"lg"'}]}},onChange:{defaultValue:null,description:"值变化回调",name:"onChange",required:!0,type:{name:"(value: number) => void"}},showLabel:{defaultValue:{value:"true"},description:"是否显示数值标签",name:"showLabel",required:!1,type:{name:"boolean"}},inkEffect:{defaultValue:{value:"true"},description:"是否启用墨滴动画",name:"inkEffect",required:!1,type:{name:"boolean"}},disabled:{defaultValue:{value:"false"},description:"是否禁用",name:"disabled",required:!1,type:{name:"boolean"}},accentColor:{defaultValue:null,description:"主题色（默认使用朱砂）",name:"accentColor",required:!1,type:{name:"string"}}}}}catch{}const xe={title:"组件/Slider 滑杆",component:l,tags:["autodocs"],argTypes:{value:{control:{type:"number",min:0,max:100},description:"当前值"},min:{control:"number",description:"最小值"},max:{control:"number",description:"最大值"},step:{control:"number",description:"步长"},size:{control:"select",options:["sm","md","lg"],description:"滑杆尺寸"},showLabel:{control:"boolean",description:"是否显示数值标签"},inkEffect:{control:"boolean",description:"是否启用墨滴晕染动画"},disabled:{control:"boolean",description:"是否禁用"},accentColor:{control:"color",description:"自定义主题色"}},args:{value:50,min:0,max:100,step:1,size:"md",showLabel:!0,inkEffect:!0,disabled:!1}},D={render:()=>{const[n,r]=t.useState(50);return e(l,{value:n,onChange:r})}},k={render:()=>{const[n,r]=t.useState(30),[a,o]=t.useState(55),[g,d]=t.useState(75);return y("div",{style:{display:"flex",flexDirection:"column",gap:"var(--space-2xl)",maxWidth:500},children:[e("h3",{style:{fontFamily:"var(--font-heading)",color:"var(--color-text-primary)"},children:"尺寸"}),e(l,{value:n,onChange:r,size:"sm"}),e(l,{value:a,onChange:o,size:"md"}),e(l,{value:g,onChange:d,size:"lg"}),e("h3",{style:{fontFamily:"var(--font-heading)",color:"var(--color-text-primary)"},children:"自定义范围"}),e(l,{value:3,onChange:()=>{},min:0,max:10,step:.5}),e("h3",{style:{fontFamily:"var(--font-heading)",color:"var(--color-text-primary)"},children:"自定义主题色"}),e(l,{value:60,onChange:()=>{},accentColor:"var(--celadon)"}),e(l,{value:40,onChange:()=>{},accentColor:"var(--apricot)"}),e("h3",{style:{fontFamily:"var(--font-heading)",color:"var(--color-text-primary)"},children:"禁用态"}),e(l,{value:50,onChange:()=>{},disabled:!0}),e("h3",{style:{fontFamily:"var(--font-heading)",color:"var(--color-text-primary)"},children:"无墨滴效果"}),e(l,{value:45,onChange:()=>{},inkEffect:!1})]})}},V={render:()=>{const[n,r]=t.useState(50);return y("div",{style:{maxWidth:400},children:[e(l,{value:n,onChange:r,size:"md",showLabel:!0,inkEffect:!0}),y("p",{style:{marginTop:"var(--space-md)",color:"var(--color-text-secondary)",fontSize:"var(--text-sm)"},children:["当前值：",n]})]})}},A={parameters:{darkMode:!0},render:()=>{const[n,r]=t.useState(65);return e("div",{style:{maxWidth:400},children:e(l,{value:n,onChange:r})})}};var q,_,I,P,T;D.parameters={...D.parameters,docs:{...(q=D.parameters)==null?void 0:q.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState(50);
    return <Slider value={value} onChange={setValue} />;
  }
}`,...(I=(_=D.parameters)==null?void 0:_.docs)==null?void 0:I.source},description:{story:"默认滑杆 — 朱砂红主题 + 墨滴晕开效果",...(T=(P=D.parameters)==null?void 0:P.docs)==null?void 0:T.description}}};var O,W,G,j,H;k.parameters={...k.parameters,docs:{...(O=k.parameters)==null?void 0:O.docs,source:{originalSource:`{
  render: () => {
    const [val1, setVal1] = useState(30);
    const [val2, setVal2] = useState(55);
    const [val3, setVal3] = useState(75);
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2xl)',
      maxWidth: 500
    }}>
        <h3 style={{
        fontFamily: 'var(--font-heading)',
        color: 'var(--color-text-primary)'
      }}>尺寸</h3>
        <Slider value={val1} onChange={setVal1} size="sm" />
        <Slider value={val2} onChange={setVal2} size="md" />
        <Slider value={val3} onChange={setVal3} size="lg" />

        <h3 style={{
        fontFamily: 'var(--font-heading)',
        color: 'var(--color-text-primary)'
      }}>自定义范围</h3>
        <Slider value={3} onChange={() => {}} min={0} max={10} step={0.5} />

        <h3 style={{
        fontFamily: 'var(--font-heading)',
        color: 'var(--color-text-primary)'
      }}>自定义主题色</h3>
        <Slider value={60} onChange={() => {}} accentColor="var(--celadon)" />
        <Slider value={40} onChange={() => {}} accentColor="var(--apricot)" />

        <h3 style={{
        fontFamily: 'var(--font-heading)',
        color: 'var(--color-text-primary)'
      }}>禁用态</h3>
        <Slider value={50} onChange={() => {}} disabled />

        <h3 style={{
        fontFamily: 'var(--font-heading)',
        color: 'var(--color-text-primary)'
      }}>无墨滴效果</h3>
        <Slider value={45} onChange={() => {}} inkEffect={false} />
      </div>;
  }
}`,...(G=(W=k.parameters)==null?void 0:W.docs)==null?void 0:G.source},description:{story:"所有滑杆变体",...(H=(j=k.parameters)==null?void 0:j.docs)==null?void 0:H.description}}};var U,K,J,Q,X;V.parameters={...V.parameters,docs:{...(U=V.parameters)==null?void 0:U.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState(50);
    return <div style={{
      maxWidth: 400
    }}>
        <Slider value={value} onChange={setValue} size="md" showLabel={true} inkEffect={true} />
        <p style={{
        marginTop: 'var(--space-md)',
        color: 'var(--color-text-secondary)',
        fontSize: 'var(--text-sm)'
      }}>
          当前值：{value}
        </p>
      </div>;
  }
}`,...(J=(K=V.parameters)==null?void 0:K.docs)==null?void 0:J.source},description:{story:"可交互的滑杆 — 拖动试试墨滴晕开效果",...(X=(Q=V.parameters)==null?void 0:Q.docs)==null?void 0:X.description}}};var Y,Z,ee,te,ne;A.parameters={...A.parameters,docs:{...(Y=A.parameters)==null?void 0:Y.docs,source:{originalSource:`{
  parameters: {
    darkMode: true
  },
  render: () => {
    const [value, setValue] = useState(65);
    return <div style={{
      maxWidth: 400
    }}>
        <Slider value={value} onChange={setValue} />
      </div>;
  }
}`,...(ee=(Z=A.parameters)==null?void 0:Z.docs)==null?void 0:ee.source},description:{story:"暗色模式下的滑杆",...(ne=(te=A.parameters)==null?void 0:te.docs)==null?void 0:ne.description}}};const Fe=["Default","Variants","Interactive","DarkMode"];export{A as DarkMode,D as Default,V as Interactive,k as Variants,Fe as __namedExportsOrder,xe as default};
