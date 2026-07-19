"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[1580],{1580:(e,n,r)=>{r.d(n,{A:()=>d});var t=r(5155),o=r(2115),i=r(2985),a=r(3321),s=r(8500),l=r.n(s);function d(){let{user:e,userData:n}=(0,i.A)(),[r,s]=(0,o.useState)(!1),d=(0,a.usePathname)(),p=n?.photoURL||e?.photoURL,c=(n?.displayName||e?.displayName||"U")[0].toUpperCase();return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)("nav",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 24px",background:"var(--surface)",borderBottom:"1px solid var(--border)",position:"sticky",top:0,zIndex:100},children:[(0,t.jsxs)(l(),{href:"/",style:{display:"flex",alignItems:"center",gap:"12px",textDecoration:"none"},children:[(0,t.jsx)("img",{src:"/logos/logo-main.png",alt:"Aero Store",style:{width:"32px",height:"32px",borderRadius:"8px",objectFit:"cover"},id:"nav-logo"}),(0,t.jsx)("span",{style:{fontSize:"20px",fontWeight:800,color:"var(--text-main)",letterSpacing:"0.5px"},children:"Aero Store"})]}),(0,t.jsxs)("div",{className:"nav-desktop-links",style:{display:"flex",gap:"16px",alignItems:"center"},children:[(0,t.jsx)(l(),{href:"/developers/",className:"btn-glass",style:{padding:"8px 16px",color:"var(--text-main)",textDecoration:"none",fontWeight:d?.includes("/developers")?700:500,opacity:d?.includes("/developers")?1:.8},children:"For Developers"}),e?(0,t.jsxs)(t.Fragment,{children:[n?.role==="admin"&&(0,t.jsx)(l(),{href:"/admin/",className:"btn-glass",style:{padding:"8px 16px",color:"#ff4d4d",textDecoration:"none",fontWeight:600,border:"1px solid rgba(255,77,77,0.3)"},children:"Admin Panel"}),(n?.role==="developer"||n?.role==="admin")&&(0,t.jsx)(l(),{href:"/dashboard/",className:"btn-glass",style:{padding:"8px 16px",color:"var(--text-main)",textDecoration:"none",fontWeight:600},children:"Dashboard"}),(0,t.jsx)(l(),{href:"/profile/",className:"btn-glass",style:{display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",width:"48px",height:"48px",padding:0,borderRadius:"50%"},children:p?(0,t.jsx)("img",{src:p,alt:"Profile",style:{width:"36px",height:"36px",borderRadius:"50%",objectFit:"cover"}}):(0,t.jsx)("div",{style:{width:"36px",height:"36px",borderRadius:"50%",background:"linear-gradient(135deg, var(--c1), var(--c2))",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:"bold"},children:c})})]}):(0,t.jsx)(l(),{href:"/login/",className:"btn-glass btn-glass-primary",style:{padding:"8px 24px",fontWeight:600,textDecoration:"none"},children:"Log in"})]}),(0,t.jsx)("button",{className:"nav-mobile-toggle",onClick:()=>s(!0),style:{display:"none",background:"none",border:"none",color:"var(--text-main)",fontSize:"26px",cursor:"pointer",padding:"4px"},children:"☰"})]}),r&&(0,t.jsx)("div",{className:"store-mobile-menu",onClick:()=>s(!1),children:(0,t.jsxs)("div",{className:"store-mobile-menu-inner",onClick:e=>e.stopPropagation(),children:[(0,t.jsxs)("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"40px"},children:[(0,t.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"12px"},children:[(0,t.jsx)("img",{src:"/logos/logo-main.png",alt:"Aero Store",style:{width:"36px",height:"36px",borderRadius:"10px"},id:"mobile-nav-logo"}),(0,t.jsx)("span",{style:{fontSize:"20px",fontWeight:700,color:"var(--text-main)"},children:"Aero Store"})]}),(0,t.jsx)("button",{onClick:()=>s(!1),style:{background:"var(--surface2)",border:"none",color:"var(--text-main)",fontSize:"18px",cursor:"pointer",width:"40px",height:"40px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"},children:"✕"})]}),(0,t.jsxs)("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:[(0,t.jsxs)(l(),{href:"/developers/",onClick:()=>s(!1),style:{display:"flex",alignItems:"center",gap:"16px",padding:"16px 20px",borderRadius:"14px",textDecoration:"none",color:d?.includes("/developers")?"#fff":"var(--text-main)",background:d?.includes("/developers")?"linear-gradient(135deg, var(--c1), var(--c2))":"var(--surface2)",fontWeight:d?.includes("/developers")?700:500,fontSize:"17px",border:d?.includes("/developers")?"none":"1px solid var(--border)"},children:[(0,t.jsx)("span",{style:{fontSize:"22px"},children:"\uD83D\uDCBB"})," For Developers"]}),e?(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(l(),{href:"/profile/",onClick:()=>s(!1),style:{display:"flex",alignItems:"center",gap:"16px",padding:"16px 20px",borderRadius:"14px",textDecoration:"none",color:d?.includes("/profile")?"#fff":"var(--text-main)",background:d?.includes("/profile")?"linear-gradient(135deg, var(--c1), var(--c2))":"var(--surface2)",fontWeight:d?.includes("/profile")?700:500,fontSize:"17px",border:d?.includes("/profile")?"none":"1px solid var(--border)"},children:[p?(0,t.jsx)("img",{src:p,alt:"Profile",style:{width:"28px",height:"28px",borderRadius:"50%",objectFit:"cover"}}):(0,t.jsx)("span",{style:{fontSize:"22px"},children:"\uD83D\uDC64"}),"My Profile"]}),(n?.role==="developer"||n?.role==="admin")&&(0,t.jsxs)(l(),{href:"/dashboard/",onClick:()=>s(!1),style:{display:"flex",alignItems:"center",gap:"16px",padding:"16px 20px",borderRadius:"14px",textDecoration:"none",color:"var(--text-main)",background:"var(--surface2)",fontWeight:500,fontSize:"17px",border:"1px solid var(--border)"},children:[(0,t.jsx)("span",{style:{fontSize:"22px"},children:"\uD83D\uDE80"})," Developer Dashboard"]}),n?.role==="admin"&&(0,t.jsxs)(l(),{href:"/admin/",onClick:()=>s(!1),style:{display:"flex",alignItems:"center",gap:"16px",padding:"16px 20px",borderRadius:"14px",textDecoration:"none",color:"#ff4d4d",background:"rgba(255,77,77,0.1)",fontWeight:700,fontSize:"17px",border:"1px solid rgba(255,77,77,0.3)"},children:[(0,t.jsx)("span",{style:{fontSize:"22px"},children:"\uD83D\uDEE1️"})," Admin Panel"]})]}):(0,t.jsx)(l(),{href:"/login/",onClick:()=>s(!1),style:{display:"flex",alignItems:"center",gap:"16px",padding:"16px 20px",borderRadius:"14px",textDecoration:"none",color:"#fff",background:"linear-gradient(135deg, var(--c1), var(--c2))",fontWeight:700,fontSize:"17px",textAlign:"center",justifyContent:"center"},children:"Log in"})]})]})}),(0,t.jsx)("style",{children:`
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
      `})]})}},3321:(e,n,r)=>{var t=r(4645);r.o(t,"usePathname")&&r.d(n,{usePathname:function(){return t.usePathname}}),r.o(t,"useRouter")&&r.d(n,{useRouter:function(){return t.useRouter}}),r.o(t,"useSearchParams")&&r.d(n,{useSearchParams:function(){return t.useSearchParams}})}}]);