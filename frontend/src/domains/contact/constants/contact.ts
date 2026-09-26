export interface ContactInfoItem {
  icon: string;
  title: string;
  lines: string[];
}

export const CONTACT_INFO: ContactInfoItem[] = [
  {
    icon: "/contact/calling.svg",
    title: "Phone Number",
    lines: ["+91 80 3366 9999"],
  },
  {
    icon: "/contact/sms.svg",
    title: "Email",
    lines: ["hcgfoundation@gmail.com"],
  },
  {
    icon: "/contact/locationicon.svg",
    title: "Address",
    lines: [
      "Ground Floor, Tower Block",
      "Unity Building Complex, Mission Road",
      "Bangalore 560027, Karnataka, India",
    ],
  },
];