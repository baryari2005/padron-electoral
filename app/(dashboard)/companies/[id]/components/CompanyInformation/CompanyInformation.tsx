"use client"

import Image from "next/image";
import { CompanyInformationProps } from "./CompanyInformation.type"
import { User } from "lucide-react";
import { CompanyForm } from "../CompanyForm";
import { ListContacts } from "../ListContacts";
import { useState } from "react";
import { NewContact } from "../NewContact";


export function CompanyInformation({ company, contacts : initialContacts }: CompanyInformationProps & { contacts: any[] }) {
    const [contacts, setContacts] = useState(initialContacts);

    function handleAddContact(newContact: any){
        setContacts((prev) => [...prev, newContact]);
    }
    return (
    <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-10 gap-y-4">
      <div className="rounder-lg bg-background shadow-md hover:shadow-lg p-4">
        <Image
          src={company.profileImage ?? "/images/default-company.png"}
          alt="Company Image"
          width={50}
          height={50}
          className="rounded-lg mb-3"
        />
        <CompanyForm company={company} />
      </div>
      <div className="rounded-lg bg-background shadow-md hover:shadow-lg p-4 h-min">
        <div className="flex items-center justify-between gap-x-2">
          <div className="flex items-center gap-x-2">
            <User className="w-5 h-5" />
            Contacts
          </div>
          <NewContact companyId={company.id} onContactCreated={handleAddContact} />
        </div>
        <ListContacts contacts={contacts}  />
      </div>
    </div>
  );
}
