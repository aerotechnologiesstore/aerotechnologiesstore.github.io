"use client";
import React from 'react';

export default function DmcaPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center py-16 px-6 relative overflow-hidden">
      <div className="w-full max-w-4xl relative z-10">
        <div className="text-center mb-16">
          <div className="font-label-lg text-primary uppercase tracking-widest mb-4">Legal Compliance</div>
          <h1 className="font-display-lg text-4xl md:text-6xl font-bold text-on-surface mb-6">
            DMCA & <span className="bg-gradient-to-r from-primary to-primary-container text-transparent bg-clip-text">Copyright Policy</span>
          </h1>
          <p className="font-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Aero Store respects the intellectual property rights of others and expects our users to do the same.
          </p>
        </div>

        <div className="prose prose-invert max-w-none font-body-lg text-on-surface-variant leading-relaxed">
          <p className="mb-6">
            In accordance with the Digital Millennium Copyright Act of 1998 (DMCA), Aero Store will respond expeditiously 
            to claims of copyright infringement committed using our service that are reported to our Designated Copyright Agent.
          </p>

          <h2 className="text-3xl font-bold text-on-surface mt-12 mb-6">Reporting Copyright Infringement</h2>
          <p className="mb-6">
            If you are a copyright owner, or are authorized to act on behalf of one, or authorized to act under any exclusive 
            right under copyright, please report alleged copyright infringements taking place on or through the Site by completing 
            the following DMCA Notice of Alleged Infringement and delivering it to our Designated Copyright Agent.
          </p>

          <div className="bg-surface-container p-6 rounded-xl border border-outline-variant mb-6">
            <h3 className="font-bold text-on-surface mb-4">Your DMCA Notice must include:</h3>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Identify the copyrighted work that you claim has been infringed.</li>
              <li>Identify the material or link you claim is infringing (including the exact URL).</li>
              <li>Provide your company affiliation (if applicable), mailing address, telephone number, and email address.</li>
              <li>Include the following statement: "I hereby state that I have a good faith belief that the disputed use of the copyrighted material is not authorized by the copyright owner, its agent, or the law."</li>
              <li>Include the following statement: "I hereby state that the information in this Notice is accurate and, under penalty of perjury, that I am the owner, or authorized to act on behalf of the owner, of the copyright or of an exclusive right under the copyright that is allegedly infringed."</li>
              <li>Provide your full legal name and your electronic or physical signature.</li>
            </ol>
          </div>

          <h2 className="text-3xl font-bold text-on-surface mt-12 mb-6">Designated Copyright Agent</h2>
          <p className="mb-6">
            Please submit your DMCA Notice directly to our abuse team:
            <br/><br/>
            <strong>Email:</strong> aerotechnologies.dev@gmail.com<br/>
            <strong>Subject Line:</strong> DMCA Takedown Request
          </p>

          <h2 className="text-3xl font-bold text-on-surface mt-12 mb-6">Repeat Infringer Policy</h2>
          <p className="mb-6">
            Aero Store maintains a strict "repeat infringer" policy. Any developer account that receives multiple valid DMCA 
            takedown notices will have their account permanently terminated, their apps deleted from our storage architecture, 
            and their associated government ID banned from registering future accounts.
          </p>
        </div>
      </div>
    </div>
  );
}
