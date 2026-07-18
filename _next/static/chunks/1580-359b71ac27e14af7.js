"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[1580],{1580:(e,n,r)=>{r.d(n,{A:()=>d});var o=r(5155),i=r(2115),t=r(2985),a=r(3321),s=r(8500),l=r.n(s);function d(){let{user:e,userData:n}=(0,t.A)(),[r,s]=(0,i.useState)(!1),d=(0,a.usePathname)(),p=n?.photoURL||e?.photoURL,c=(n?.displayName||e?.displayName||"U")[0].toUpperCase();return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("nav",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 24px",background:"rgba(0,0,0,0.85)",backdropFilter:"blur(20px)",borderBottom:"1px solid var(--border)",position:"sticky",top:0,zIndex:100},children:[(0,o.jsxs)(l(),{href:"/",style:{display:"flex",alignItems:"center",gap:"12px",textDecoration:"none"},children:[(0,o.jsx)("img",{src:"/logos/logo-orange.png",alt:"Aero Store",style:{width:"32px",height:"32px",borderRadius:"8px",objectFit:"cover"},id:"nav-logo"}),(0,o.jsx)("span",{style:{fontSize:"20px",fontWeight:800,color:"#fff",letterSpacing:"0.5px"},children:"Aero Store"})]}),(0,o.jsxs)("div",{className:"nav-desktop-links",style:{display:"flex",gap:"24px",alignItems:"center"},children:[(0,o.jsx)(l(),{href:"/apps/",style:{color:"#fff",textDecoration:"none",fontWeight:d?.includes("/apps")?700:500,opacity:d?.includes("/apps")?1:.7},children:"Browse Apps"}),e?(0,o.jsxs)(o.Fragment,{children:[n?.role==="admin"&&(0,o.jsx)(l(),{href:"/admin/",style:{padding:"8px 16px",borderRadius:"8px",background:"rgba(255,77,77,0.2)",border:"1px solid rgba(255,77,77,0.5)",color:"#ff4d4d",textDecoration:"none",fontWeight:600},children:"Admin Panel"}),(n?.role==="developer"||n?.role==="admin")&&(0,o.jsx)(l(),{href:"/dashboard/",style:{padding:"8px 16px",borderRadius:"8px",border:"1px solid var(--border)",color:"#fff",textDecoration:"none",fontWeight:600},children:"Dashboard"}),(0,o.jsx)(l(),{href:"/profile/",style:{display:"flex",alignItems:"center",textDecoration:"none"},children:p?(0,o.jsx)("img",{src:p,alt:"Profile",style:{width:"36px",height:"36px",borderRadius:"50%",objectFit:"cover",border:"2px solid var(--c2)"}}):(0,o.jsx)("div",{style:{width:"36px",height:"36px",borderRadius:"50%",background:"linear-gradient(135deg, var(--c1), var(--c2))",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:"bold"},children:c})})]}):(0,o.jsx)(l(),{href:"/login/",style:{padding:"8px 16px",background:"linear-gradient(135deg, var(--c1), var(--c2))",color:"#fff",textDecoration:"none",borderRadius:"8px",fontWeight:600},children:"Log in"})]}),(0,o.jsx)("button",{className:"nav-mobile-toggle",onClick:()=>s(!0),style:{display:"none",background:"none",border:"none",color:"#fff",fontSize:"26px",cursor:"pointer",padding:"4px"},children:"☰"})]}),r&&(0,o.jsx)("div",{className:"store-mobile-menu",onClick:()=>s(!1),children:(0,o.jsxs)("div",{className:"store-mobile-menu-inner",onClick:e=>e.stopPropagation(),children:[(0,o.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"40px"},children:[(0,o.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[(0,o.jsx)("img",{src:"/logos/logo-orange.png",alt:"Aero Store",style:{width:"36px",height:"36px",borderRadius:"10px"},id:"mobile-nav-logo"}),(0,o.jsx)("span",{style:{fontSize:"20px",fontWeight:700,color:"#fff"},children:"Aero Store"})]}),(0,o.jsx)("button",{onClick:()=>s(!1),style:{background:"rgba(255,255,255,0.08)",border:"none",color:"#fff",fontSize:"18px",cursor:"pointer",width:"40px",height:"40px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"},children:"✕"})]}),(0,o.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:[(0,o.jsxs)(l(),{href:"/apps/",onClick:()=>s(!1),style:{display:"flex",alignItems:"center",gap:"16px",padding:"16px 20px",borderRadius:"14px",textDecoration:"none",color:"#fff",background:d?.includes("/apps")?"linear-gradient(135deg, var(--c1), var(--c2))":"rgba(255,255,255,0.04)",fontWeight:d?.includes("/apps")?700:500,fontSize:"17px",border:d?.includes("/apps")?"none":"1px solid rgba(255,255,255,0.06)"},children:[(0,o.jsx)("span",{style:{fontSize:"22px"},children:"\uD83D\uDCF1"})," Browse Apps"]}),e?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)(l(),{href:"/profile/",onClick:()=>s(!1),style:{display:"flex",alignItems:"center",gap:"16px",padding:"16px 20px",borderRadius:"14px",textDecoration:"none",color:"#fff",background:d?.includes("/profile")?"linear-gradient(135deg, var(--c1), var(--c2))":"rgba(255,255,255,0.04)",fontWeight:d?.includes("/profile")?700:500,fontSize:"17px",border:d?.includes("/profile")?"none":"1px solid rgba(255,255,255,0.06)"},children:[p?(0,o.jsx)("img",{src:p,alt:"Profile",style:{width:"28px",height:"28px",borderRadius:"50%",objectFit:"cover"}}):(0,o.jsx)("span",{style:{fontSize:"22px"},children:"\uD83D\uDC64"}),"My Profile"]}),(n?.role==="developer"||n?.role==="admin")&&(0,o.jsxs)(l(),{href:"/dashboard/",onClick:()=>s(!1),style:{display:"flex",alignItems:"center",gap:"16px",padding:"16px 20px",borderRadius:"14px",textDecoration:"none",color:"#fff",background:"rgba(255,255,255,0.04)",fontWeight:500,fontSize:"17px",border:"1px solid rgba(255,255,255,0.06)"},children:[(0,o.jsx)("span",{style:{fontSize:"22px"},children:"\uD83D\uDE80"})," Developer Dashboard"]}),n?.role==="admin"&&(0,o.jsxs)(l(),{href:"/admin/",onClick:()=>s(!1),style:{display:"flex",alignItems:"center",gap:"16px",padding:"16px 20px",borderRadius:"14px",textDecoration:"none",color:"#ff4d4d",background:"rgba(255,77,77,0.1)",fontWeight:700,fontSize:"17px",border:"1px solid rgba(255,77,77,0.3)"},children:[(0,o.jsx)("span",{style:{fontSize:"22px"},children:"\uD83D\uDEE1️"})," Admin Panel"]})]}):(0,o.jsx)(l(),{href:"/login/",onClick:()=>s(!1),style:{display:"flex",alignItems:"center",gap:"16px",padding:"16px 20px",borderRadius:"14px",textDecoration:"none",color:"#fff",background:"linear-gradient(135deg, var(--c1), var(--c2))",fontWeight:700,fontSize:"17px",textAlign:"center",justifyContent:"center"},children:"Log in"})]})]})}),(0,o.jsx)("style",{children:`
        @media (max-width: 768px) {
          .nav-desktop-links { display: none !important; }
          .nav-mobile-toggle { display: block !important; }
        }

        /* Full-screen mobile menu */
        .store-mobile-menu {
          position: fixed;
          inset: 0;
          z-index: 500;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(12px);
          animation: fadeIn 0.2s ease;
        }

        .store-mobile-menu-inner {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 85%;
          max-width: 320px;
          background: var(--bg);
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          border-left: 1px solid var(--border);
          animation: slideInRight 0.25s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `})]})}},3321:(e,n,r)=>{var o=r(4645);r.o(o,"usePathname")&&r.d(n,{usePathname:function(){return o.usePathname}}),r.o(o,"useRouter")&&r.d(n,{useRouter:function(){return o.useRouter}}),r.o(o,"useSearchParams")&&r.d(n,{useSearchParams:function(){return o.useSearchParams}})}}]);