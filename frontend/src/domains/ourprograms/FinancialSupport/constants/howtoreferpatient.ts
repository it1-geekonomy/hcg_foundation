export interface ReferralStep {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const referralSteps: ReferralStep[] = [
  {
    id: "01",
    title: "Patient Identification",
    description:
      "Doctors and Medical Social Workers (MSWs) identify financially challenged patients receiving treatment at the hospital.",
    icon: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790836156886-mquou-fi_13076699.webp",
  },
  {
    id: "02",
    title: "Preliminary Assessment",
    description:
      "The MSW completes the preliminary assessment, collects supporting documents, and informs the Patient Care Coordinator.",
    icon: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790836189559-lzimd-group.webp",
  },
  {
    id: "03",
    title: "Treatment Estimate",
    description:
      "The hospital provides a subsidised treatment estimate for Foundation patients undergoing surgery, radiation, or BMT.",
    icon: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790836301493-1toqu-fi_2376100.webp",
  },
  {
    id: "04",
    title: "Financial Verification",
    description:
      "Doctors and Medical Social Workers (MSWs) verify the financial background of patients receiving treatment at the hospital.",
    icon: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790836356548-qthgi-fi_5106388.webp",
  },
  {
    id: "05",
    title: "Committee Review",
    description:
      "The Patient Care Coordinator meets the patient and family, verifies their financial situation, and conducts a background assessment.",
    icon: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790836388834-tr77h-group-1-.webp",
  },
  {
    id: "06",
    title: "Fundraising Support",
    description:
      "If additional support is required, the HCG Foundation team raises funds to bridge the treatment gap.",
    icon: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790836426541-av904-group-2-.webp",
  },
  {
    id: "07",
    title: "Billing & Discounts",
    description:
      "The hospital extends approved discounts to eligible HCG Foundation patients during the billing process.",
    icon: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790836464094-jz7rp-layer2.webp",
  },
  {
    id: "08",
    title: "Foundation Payment",
    description:
      "The HCG Foundation pays the approved contribution directly to the hospital, while the patient pays the remaining amount.",
    icon: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790836505320-vyla2-fi_1611154.webp",
  },
  {
    id: "09",
    title: "Progress Update",
    description:
      "The Medical Social Worker shares the patient's progress and coordinates future admissions to ensure continued support.",
    icon: "https://pub-bbab4b37d630465e8c49b68c7d045302.r2.dev/website/1790836564314-8s0kb-group-3-.webp",
  },
];