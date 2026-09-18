import React from "react";
import { Phone, Mail, MapPin } from "lucide-react";
import Typography from "@/lib/Typography";

export interface ContactInfoItem {
  icon: React.ElementType;
  title: string;
  content: React.ReactNode;
}

export const CONTACT_INFO: ContactInfoItem[] = [
  {
    icon: Phone,
    title: "Phone Number",
    content: (
      <div className="mt-1">
        <Typography variant="body-9" as="p" className="font-manrope font-normal text-left text-[#0D2838]">
          +91 80 3366 9999
        </Typography>
      </div>
    ),
  },
  {
    icon: Mail,
    title: "Email",
    content: (
      <div className="mt-1">
        <Typography variant="body-9" as="p" className="font-manrope font-normal text-left text-[#0D2838]">
          hcgfoundation@gmail.com
        </Typography>
      </div>
    ),
  },
  {
    icon: MapPin,
    title: "Address",
    content: (
      <div className="mt-1">
        <Typography variant="body-9" as="p" className="font-manrope font-normal text-left text-[#0D2838]">
          Ground Floor, Tower Block
          <br />
          Unity Building Complex, Mission Road
          <br />
          Bangalore 560027, Karnataka, India
        </Typography>
      </div>
    ),
  },
];
