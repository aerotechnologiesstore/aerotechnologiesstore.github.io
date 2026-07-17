(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[954],{1949:(e,r,a)=>{"use strict";a.r(r),a.d(r,{default:()=>d});var t=a(5155),n=a(2115),i=a(6743),o=a(3321);function s(){let e=(0,o.usePathname)(),[r,a]=(0,n.useState)(!1),i=[{name:"Overview",path:"/dashboard/",icon:"\uD83D\uDCCA"},{name:"Upload App",path:"/dashboard/upload/",icon:"\uD83D\uDE80"},{name:"My Apps",path:"/dashboard/apps/",icon:"\uD83D\uDCF1"},{name:"Settings",path:"/dashboard/settings/",icon:"⚙️"}],s=e.endsWith("/")?e:e+"/";return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)("aside",{className:"dash-sidebar",children:[(0,t.jsx)("div",{style:{padding:"0 24px",marginBottom:"32px"},children:(0,t.jsxs)("a",{href:"/aerostore/",style:{textDecoration:"none",display:"flex",alignItems:"center",gap:"12px"},children:[(0,t.jsx)("div",{style:{width:"32px",height:"32px",background:"linear-gradient(135deg, var(--c1), var(--c2))",borderRadius:"8px"}}),(0,t.jsx)("span",{style:{fontSize:"18px",fontWeight:700,color:"#fff",letterSpacing:"0.5px"},children:"Aero Dev"})]})}),(0,t.jsx)("nav",{style:{display:"flex",flexDirection:"column",gap:"6px",padding:"0 16px",flex:1},children:i.map(e=>{let r=`/aerostore${e.path}`,a=s===r;return(0,t.jsxs)("a",{href:r,style:{display:"flex",alignItems:"center",gap:"12px",padding:"12px 16px",borderRadius:"10px",textDecoration:"none",color:a?"#fff":"rgba(255,255,255,0.55)",background:a?"var(--surface2)":"transparent",border:a?"1px solid var(--border)":"1px solid transparent",fontWeight:a?600:400,fontSize:"15px",transition:"all 0.2s"},children:[(0,t.jsx)("span",{style:{fontSize:"18px",opacity:a?1:.5},children:e.icon}),e.name]},e.path)})}),(0,t.jsx)("div",{style:{padding:"16px 24px",borderTop:"1px solid var(--border)"},children:(0,t.jsx)("a",{href:"/aerostore/profile/",style:{fontSize:"14px",color:"rgba(255,255,255,0.4)",textDecoration:"none"},children:"← Back to Profile"})})]}),(0,t.jsxs)("div",{className:"dash-mobile-bar",children:[(0,t.jsx)("button",{onClick:()=>a(!0),style:{background:"none",border:"none",color:"#fff",fontSize:"22px",cursor:"pointer",padding:"4px"},children:"☰"}),(0,t.jsx)("span",{style:{fontSize:"16px",fontWeight:700,letterSpacing:"0.5px"},children:"Aero Dev"}),(0,t.jsx)("a",{href:"/aerostore/profile/",style:{width:"32px",height:"32px",borderRadius:"50%",background:"linear-gradient(135deg, var(--c1), var(--c2))",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:"#fff",fontSize:"14px",fontWeight:700},children:"P"})]}),r&&(0,t.jsx)("div",{className:"dash-mobile-menu",onClick:()=>a(!1),children:(0,t.jsxs)("div",{className:"dash-mobile-menu-inner",onClick:e=>e.stopPropagation(),children:[(0,t.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"40px"},children:[(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[(0,t.jsx)("div",{style:{width:"36px",height:"36px",background:"linear-gradient(135deg, var(--c1), var(--c2))",borderRadius:"10px"}}),(0,t.jsx)("span",{style:{fontSize:"20px",fontWeight:700,color:"#fff"},children:"Aero Dev"})]}),(0,t.jsx)("button",{onClick:()=>a(!1),style:{background:"rgba(255,255,255,0.08)",border:"none",color:"#fff",fontSize:"18px",cursor:"pointer",width:"40px",height:"40px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"},children:"✕"})]}),(0,t.jsx)("nav",{style:{display:"flex",flexDirection:"column",gap:"8px"},children:i.map(e=>{let r=`/aerostore${e.path}`,n=s===r;return(0,t.jsxs)("a",{href:r,onClick:()=>a(!1),style:{display:"flex",alignItems:"center",gap:"16px",padding:"16px 20px",borderRadius:"14px",textDecoration:"none",color:n?"#fff":"rgba(255,255,255,0.6)",background:n?"linear-gradient(135deg, var(--c1), var(--c2))":"rgba(255,255,255,0.04)",fontWeight:n?700:500,fontSize:"17px",transition:"all 0.2s",border:n?"none":"1px solid rgba(255,255,255,0.06)"},children:[(0,t.jsx)("span",{style:{fontSize:"22px"},children:e.icon}),e.name]},e.path)})}),(0,t.jsx)("div",{style:{marginTop:"auto",paddingTop:"32px",borderTop:"1px solid rgba(255,255,255,0.06)"},children:(0,t.jsx)("a",{href:"/aerostore/",onClick:()=>a(!1),style:{display:"flex",alignItems:"center",gap:"12px",padding:"14px 20px",borderRadius:"14px",textDecoration:"none",color:"rgba(255,255,255,0.5)",fontSize:"15px",background:"rgba(255,255,255,0.03)"},children:"\uD83C\uDFE0 Back to Aero Store"})})]})}),(0,t.jsx)("style",{children:`
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
      `})]})}function d({children:e}){return(0,t.jsxs)(i.A,{requireRole:"developer",children:[(0,t.jsxs)("div",{style:{display:"flex",minHeight:"100vh",background:"var(--bg)"},children:[(0,t.jsx)(s,{}),(0,t.jsx)("main",{className:"dash-main",style:{flex:1,padding:"40px",overflowY:"auto"},children:(0,t.jsx)("div",{style:{maxWidth:"1000px",margin:"0 auto"},children:e})})]}),(0,t.jsx)("style",{children:`
        @media (max-width: 768px) {
          .dash-main {
            padding: 16px !important;
            padding-top: 72px !important;
          }
        }
      `})]})}},2985:(e,r,a)=>{"use strict";a.d(r,{A:()=>l,AuthProvider:()=>p});var t=a(5155),n=a(2115),i=a(9997),o=a(1531),s=a(9674);let d=(0,n.createContext)({user:null,userData:null,loading:!0}),l=()=>(0,n.useContext)(d);function p({children:e}){let[r,a]=(0,n.useState)(null),[l,c]=(0,n.useState)(null),[x,h]=(0,n.useState)(!0);return(0,n.useEffect)(()=>{let e=(0,i.hg)(s.j,async e=>{if(a(e),e)try{let r=(0,o.H9)(s.db,"users",e.uid),a=await (0,o.x7)(r);a.exists()?c(a.data()):c(null)}catch(e){console.error("Error fetching user data:",e),c(null)}else c(null);h(!1)});return()=>e()},[]),(0,t.jsx)(d.Provider,{value:{user:r,userData:l,loading:x},children:e})}},3321:(e,r,a)=>{"use strict";var t=a(4645);a.o(t,"usePathname")&&a.d(r,{usePathname:function(){return t.usePathname}}),a.o(t,"useRouter")&&a.d(r,{useRouter:function(){return t.useRouter}}),a.o(t,"useSearchParams")&&a.d(r,{useSearchParams:function(){return t.useSearchParams}})},3942:(e,r,a)=>{Promise.resolve().then(a.bind(a,1949))},6743:(e,r,a)=>{"use strict";a.d(r,{A:()=>s});var t=a(5155),n=a(2115),i=a(3321),o=a(2985);function s({children:e,requireRole:r}){let{user:a,userData:d,loading:l}=(0,o.A)(),p=(0,i.useRouter)(),c=(0,i.usePathname)();return((0,n.useEffect)(()=>{!l&&(a?r&&d&&d.role!==r&&"admin"!==d.role&&("developer"===r?p.replace("/register/developer"):p.replace("/")):p.replace("/login"))},[a,d,l,p,c,r]),l||!a)?(0,t.jsx)("div",{style:{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center"},children:(0,t.jsx)("div",{style:{color:"var(--c2)",fontSize:"18px"},children:"Loading..."})}):r&&d&&d.role!==r&&"admin"!==d.role?null:(0,t.jsx)(t.Fragment,{children:e})}},9674:(e,r,a)=>{"use strict";a.d(r,{A:()=>l,db:()=>d,j:()=>s});var t=a(7873),n=a(9997),i=a(1531);let o=0===(0,t.Dk)().length?(0,t.Wp)({apiKey:"AIzaSyAZMC9gBR2j_omhCDRHixBn-h5r1RePqIY",authDomain:"aero-store-b6a9b.firebaseapp.com",projectId:"aero-store-b6a9b",storageBucket:"aero-store-b6a9b.firebasestorage.app",messagingSenderId:"779360959349",appId:"1:779360959349:web:a17ed297270975cc1db13c"}):(0,t.Dk)()[0],s=(0,n.xI)(o),d=(0,i.aU)(o),l=o}},e=>{e.O(0,[254,81,354,949,441,794,358],()=>e(e.s=3942)),_N_E=e.O()}]);