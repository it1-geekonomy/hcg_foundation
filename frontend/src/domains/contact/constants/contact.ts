export interface ContactInfoItem {
  icon: string;
  title: string;
  lines: string[];
}

export const CONTACT_INFO: ContactInfoItem[] = [
  {
    icon: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791171888800-73088-call-calling.webp",
    title: "Phone Number",
    lines: ["+91 80 3366 9999"],
  },
  {
    icon: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791171947668-9y7tq-sms-notification.webp",
    title: "Email",
    lines: ["hcgfoundation@gmail.com"],
  },
  {
    icon: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1791171990748-iwcsv-boxicons_location-filled.webp",
    title: "Address",
    lines: [
      "Ground Floor, Tower Block",
      "Unity Building Complex, Mission Road",
      "Bangalore 560027, Karnataka, India",
    ],
  },
];