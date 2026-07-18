(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[1954],{1949:(e,r,t)=>{"use strict";t.r(r),t.d(r,{default:()=>p});var a=t(5155),n=t(2115),i=t(6743),o=t(3321),s=t(8500),d=t.n(s);function l(){let e=(0,o.usePathname)(),[r,t]=(0,n.useState)(!1),i=[{name:"Overview",path:"/dashboard/",icon:"\uD83D\uDCCA"},{name:"Upload App",path:"/dashboard/upload/",icon:"\uD83D\uDE80"},{name:"My Apps",path:"/dashboard/apps/",icon:"\uD83D\uDCF1"},{name:"Verification",path:"/dashboard/verification/",icon:"\uD83D\uDEE1️"},{name:"Settings",path:"/dashboard/settings/",icon:"⚙️"}],s=e.endsWith("/")?e:e+"/";return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsxs)("aside",{className:"dash-sidebar",children:[(0,a.jsx)("div",{style:{padding:"0 24px",marginBottom:"32px"},children:(0,a.jsxs)(d(),{href:"/",style:{textDecoration:"none",display:"flex",alignItems:"center",gap:"12px"},children:[(0,a.jsx)("div",{style:{width:"32px",height:"32px",background:"linear-gradient(135deg, var(--c1), var(--c2))",borderRadius:"8px"}}),(0,a.jsx)("span",{style:{fontSize:"18px",fontWeight:700,color:"#fff",letterSpacing:"0.5px"},children:"Aero Dev"})]})}),(0,a.jsx)("div",{role:"navigation",style:{display:"flex",flexDirection:"column",gap:"6px",padding:"0 16px",flex:1},children:i.map(e=>{let r=`${e.path}`,t=s.endsWith(r);return(0,a.jsxs)(d(),{href:r,style:{display:"flex",alignItems:"center",gap:"12px",padding:"12px 16px",borderRadius:"10px",textDecoration:"none",color:t?"#fff":"rgba(255,255,255,0.55)",background:t?"var(--surface2)":"transparent",border:t?"1px solid var(--border)":"1px solid transparent",fontWeight:t?600:400,fontSize:"15px",transition:"all 0.2s"},children:[(0,a.jsx)("span",{style:{fontSize:"18px",opacity:t?1:.5},children:e.icon}),e.name]},e.path)})}),(0,a.jsx)("div",{style:{padding:"16px 24px",borderTop:"1px solid var(--border)"},children:(0,a.jsx)(d(),{href:"/profile/",style:{fontSize:"14px",color:"rgba(255,255,255,0.4)",textDecoration:"none"},children:"← Back to Profile"})})]}),(0,a.jsxs)("div",{className:"dash-mobile-bar",children:[(0,a.jsx)("button",{onClick:()=>t(!0),style:{background:"none",border:"none",color:"#fff",fontSize:"22px",cursor:"pointer",padding:"4px"},children:"☰"}),(0,a.jsx)("span",{style:{fontSize:"16px",fontWeight:700,letterSpacing:"0.5px"},children:"Aero Dev"}),(0,a.jsx)(d(),{href:"/profile/",style:{width:"32px",height:"32px",borderRadius:"50%",background:"linear-gradient(135deg, var(--c1), var(--c2))",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:"#fff",fontSize:"14px",fontWeight:700},children:"P"})]}),r&&(0,a.jsx)("div",{className:"dash-mobile-menu",onClick:()=>t(!1),children:(0,a.jsxs)("div",{className:"dash-mobile-menu-inner",onClick:e=>e.stopPropagation(),children:[(0,a.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"32px"},children:[(0,a.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[(0,a.jsx)("div",{style:{width:"32px",height:"32px",background:"linear-gradient(135deg, var(--c1), var(--c2))",borderRadius:"10px"}}),(0,a.jsx)("span",{style:{fontSize:"18px",fontWeight:700,color:"#fff"},children:"Aero Dev"})]}),(0,a.jsx)("button",{onClick:()=>t(!1),style:{background:"rgba(255,255,255,0.08)",border:"none",color:"#fff",fontSize:"18px",cursor:"pointer",width:"36px",height:"36px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"},children:"✕"})]}),(0,a.jsx)("div",{role:"navigation",style:{display:"flex",flexDirection:"column",gap:"6px"},children:i.map(e=>{let r=`${e.path}`,n=s.endsWith(r);return(0,a.jsxs)(d(),{href:r,onClick:()=>t(!1),style:{display:"flex",alignItems:"center",gap:"12px",padding:"12px 16px",borderRadius:"12px",textDecoration:"none",color:n?"#fff":"rgba(255,255,255,0.6)",background:n?"linear-gradient(135deg, var(--c1), var(--c2))":"transparent",fontWeight:n?700:500,fontSize:"16px",transition:"all 0.2s",border:n?"none":"1px solid rgba(255,255,255,0.06)"},children:[(0,a.jsx)("span",{style:{fontSize:"20px"},children:e.icon}),e.name]},e.path)})}),(0,a.jsx)("div",{style:{marginTop:"auto",paddingTop:"24px",borderTop:"1px solid rgba(255,255,255,0.06)"},children:(0,a.jsx)(d(),{href:"/",onClick:()=>t(!1),style:{display:"flex",alignItems:"center",gap:"12px",padding:"12px 16px",borderRadius:"12px",textDecoration:"none",color:"rgba(255,255,255,0.5)",fontSize:"15px",background:"rgba(255,255,255,0.03)"},children:"\uD83C\uDFE0 Back to Aero Store"})})]})}),(0,a.jsx)("style",{children:`
        /* Desktop sidebar */
        .dash-sidebar {
          width: 260px;
          background: var(--surface);
          border-right: 1px solid var(--border);
          height: 100vh;
          padding: 24px 0;
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
        }

        /* Mobile top bar - hidden on desktop */
        .dash-mobile-bar {
          display: none;
        }

        @media (max-width: 768px) {
          /* Hide desktop sidebar on mobile */
          .dash-sidebar {
            display: none !important;
          }

          /* Show mobile top bar */
          .dash-mobile-bar {
            display: flex !important;
            align-items: center;
            justify-content: space-between;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 200;
            height: 56px;
            padding: 0 16px;
            background: rgba(0,0,0,0.85);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid var(--border);
          }

          /* Full-screen mobile menu */
          .dash-mobile-menu {
            position: fixed;
            inset: 0;
            z-index: 500;
            background: rgba(0,0,0,0.7);
            backdrop-filter: blur(8px);
            animation: fadeIn 0.2s ease;
          }

          .dash-mobile-menu-inner {
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            width: 85%;
            max-width: 320px;
            background: var(--bg);
            padding: 32px 24px;
            display: flex;
            flex-direction: column;
            border-right: 1px solid var(--border);
            animation: slideIn 0.25s ease;
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes slideIn {
            from { transform: translateX(-100%); }
            to { transform: translateX(0); }
          }
        }
      `})]})}function p({children:e}){return(0,a.jsxs)(i.A,{requireRole:"developer",children:[(0,a.jsxs)("div",{style:{display:"flex",minHeight:"100vh",background:"var(--bg)"},children:[(0,a.jsx)(l,{}),(0,a.jsx)("main",{className:"dash-main",style:{flex:1,padding:"40px",overflowY:"auto"},children:(0,a.jsx)("div",{style:{maxWidth:"1000px",margin:"0 auto"},children:e})})]}),(0,a.jsx)("style",{children:`
        @media (max-width: 768px) {
          .dash-main {
            padding: 16px !important;
            padding-top: 72px !important;
          }
        }
      `})]})}},2985:(e,r,t)=>{"use strict";t.d(r,{A:()=>l,AuthProvider:()=>p});var a=t(5155),n=t(2115),i=t(9997),o=t(1531),s=t(9674);let d=(0,n.createContext)({user:null,userData:null,loading:!0}),l=()=>(0,n.useContext)(d);function p({children:e}){let[r,t]=(0,n.useState)(null),[l,c]=(0,n.useState)(null),[x,h]=(0,n.useState)(!0);return(0,n.useEffect)(()=>{let e=(0,i.hg)(s.auth,async e=>{if(t(e),e)try{let r=(0,o.doc)(s.db,"users",e.uid),t=await (0,o.getDoc)(r);t.exists()?c(t.data()):c(null)}catch(e){console.error("Error fetching user data:",e),c(null)}else c(null);h(!1)});return()=>e()},[]),(0,a.jsx)(d.Provider,{value:{user:r,userData:l,loading:x},children:e})}},3321:(e,r,t)=>{"use strict";var a=t(4645);t.o(a,"usePathname")&&t.d(r,{usePathname:function(){return a.usePathname}}),t.o(a,"useRouter")&&t.d(r,{useRouter:function(){return a.useRouter}}),t.o(a,"useSearchParams")&&t.d(r,{useSearchParams:function(){return a.useSearchParams}})},3942:(e,r,t)=>{Promise.resolve().then(t.bind(t,1949))},6743:(e,r,t)=>{"use strict";t.d(r,{A:()=>s});var a=t(5155),n=t(2115),i=t(3321),o=t(2985);function s({children:e,requireRole:r}){let{user:t,userData:d,loading:l}=(0,o.A)(),p=(0,i.useRouter)(),c=(0,i.usePathname)();return((0,n.useEffect)(()=>{!l&&(t?r&&d&&d.role!==r&&"admin"!==d.role&&("developer"===r?p.replace("/register/developer"):p.replace("/")):p.replace("/login"))},[t,d,l,p,c,r]),l||!t)?(0,a.jsx)("div",{style:{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center"},children:(0,a.jsx)("div",{style:{color:"var(--c2)",fontSize:"18px"},children:"Loading..."})}):r&&d&&d.role!==r&&"admin"!==d.role?null:(0,a.jsx)(a.Fragment,{children:e})}},9674:(e,r,t)=>{"use strict";t.r(r),t.d(r,{auth:()=>d,db:()=>l,default:()=>c,storage:()=>p});var a=t(7873),n=t(9997),i=t(1531),o=t(9058);let s=0===(0,a.Dk)().length?(0,a.Wp)({apiKey:"AIzaSyAZMC9gBR2j_omhCDRHixBn-h5r1RePqIY",authDomain:"aero-store-b6a9b.firebaseapp.com",projectId:"aero-store-b6a9b",storageBucket:"aero-store-b6a9b.firebasestorage.app",messagingSenderId:"779360959349",appId:"1:779360959349:web:a17ed297270975cc1db13c"}):(0,a.Dk)()[0],d=(0,n.xI)(s),l=(0,i.aU)(s),p=(0,o.c7)(s),c=s}},e=>{e.O(0,[5254,5081,4354,2573,8500,8441,3794,7358],()=>e(e.s=3942)),_N_E=e.O()}]);