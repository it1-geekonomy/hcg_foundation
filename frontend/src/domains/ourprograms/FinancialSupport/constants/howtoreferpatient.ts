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
    icon: "/financialbanner/searchicon.png",
  },
  {
    id: "02",
    title: "Preliminary Assessment",
    description:
      "The MSW completes the preliminary assessment, collects supporting documents, and informs the Patient Care Coordinator.",
    icon: "/financialbanner/preliminary.png",
  },
  {
    id: "03",
    title: "Treatment Estimate",
    description:
      "The hospital provides a subsidised treatment estimate for Foundation patients undergoing surgery, radiation, or BMT.",
    icon: "/financialbanner/treatment.png",
  },
  {
    id: "04",
    title: "Financial Verification",
    description:
      "Doctors and Medical Social Workers (MSWs) verify the financial background of patients receiving treatment at the hospital.",
    icon: "/financialbanner/financeicon.png",
  },
  {
    id: "05",
    title: "Committee Review",
    description:
      "The Patient Care Coordinator shares the patient's file for review, verifies the details, and conducts a background assessment.",
    icon: "/financialbanner/reviewicon.png",
  },
  {
    id: "06",
    title: "Fundraising Support",
    description:
      "If additional support is required, the HCG Foundation team assists in bridging the treatment gap.",
    icon: "/financialbanner/fundicon.png",
  },
  {
    id: "07",
    title: "Billing & Discounts",
    description:
      "The hospital extends approved discounts to eligible HCG Foundation patients during the billing process.",
    icon: "/financialbanner/billingicon.png",
  },
  {
    id: "08",
    title: "Foundation Payment",
    description:
      "The HCG Foundation pays the approved contribution directly to the hospital, while the patient pays the remaining amount.",
    icon: "/financialbanner/foundationicon.png",
  },
  {
    id: "09",
    title: "Progress Update",
    description:
      "The Medical Social Worker shares the patient's progress and coordinates future admissions to ensure continued support.",
    icon: "/financialbanner/progressicon.png",
  },
];