/**
 * 80G donation terms — shown from the "80G Terms & Conditions" link on the donation forms.
 *
 * From 1 April 2026 the Income-tax Act, 2025 replaced the Income-tax Act, 1961, and Section 80G was
 * carried forward as Section 133. The full text below is Section 133 as published in the Gazette of India
 * (Act 30 of 2025). Donors still know the benefit as "80G", so that name stays on the link and the title.
 */

export type Section80GBlock = {
  /** Clause number shown in the hanging column, e.g. "(1)", "(xxiv)". */
  label?: string;
  /** Run-in heading for explanations and provisos, e.g. "Explanation 1." */
  lead?: string;
  text: string;
  /** Nesting level: 0 = sub-section, 1 = clause, 2 = sub-clause, … */
  depth: number;
  tone?: "omitted" | "note";
};

export const SECTION_80G_ACT = "Income-tax Act, 2025 · Section 133";
export const SECTION_80G_TITLE = "80G Tax Benefit";
export const SECTION_80G_SUBTITLE =
  "Deduction in respect of donations to certain funds, charitable institutions, etc. (formerly Section 80G of the Income-tax Act, 1961)";
export const SECTION_80G_FULL_TEXT_HEADING = "Full text of Section 133";

export const SECTION_80G_KEY_POINTS: string[] = [
  "As an approved charitable institution, donations to The HCG Foundation qualify for a deduction of 50% of the amount you donate.",
  "The amount that qualifies is limited to 10% of your adjusted gross total income; anything above that limit is ignored when the deduction is worked out.",
  "The deduction can be claimed only if you file your return under the old tax regime. It is not available under the new (default) tax regime.",
  "Only donations of money qualify, and any donation above ₹2,000 must be paid by a mode other than cash, such as UPI, card, net banking or cheque.",
  "Your claim is allowed on the basis of the donation details we report to the Income Tax Department, so please share your PAN or Aadhaar and your name exactly as it appears on that document. We will then issue your donation certificate.",
  "An amount allowed as a deduction under this section cannot be claimed again under any other provision of the Act.",
];

export const SECTION_80G_NOTES: string[] = [
  "Donations made on or before 31 March 2026 are covered by Section 80G of the Income-tax Act, 1961, which gave the same 50% deduction within the same 10% limit.",
  "This summary is for general information only and is not tax advice. Please consult your tax adviser before claiming the deduction.",
];

export const SECTION_80G_TEXT: Section80GBlock[] = [
  {
    label: "(1)",
    depth: 0,
    text: "In computing the total income of an assessee, there shall be deducted, as per and subject to the provisions of this section,—",
  },
  {
    label: "(a)",
    depth: 1,
    text: "the whole of the aggregate of the sum or the sums paid by the assessee, in the tax year as donations to—",
  },
  { label: "(i)", depth: 2, text: "the National Defence Fund set up by the Central Government; or" },
  {
    label: "(ii)",
    depth: 2,
    text: "the Prime Minister’s National Relief Fund or the Prime Minister’s Citizen Assistance and Relief in Emergency Situations Fund (PM CARES FUND); or",
  },
  { label: "(iii)", depth: 2, text: "the Prime Minister’s Armenia Earthquake Relief Fund; or" },
  { label: "(iv)", depth: 2, text: "the Africa (Public Contributions-India) Fund; or" },
  { label: "(v)", depth: 2, text: "the National Children’s Fund; or" },
  { label: "(vi)", depth: 2, text: "the National Foundation for Communal Harmony; or" },
  {
    label: "(vii)",
    depth: 2,
    text: "a University or any educational institution of national eminence as may be approved by the prescribed authority in this behalf; or",
  },
  {
    label: "(viii)",
    depth: 2,
    text: "any fund set up by the State Government of Gujarat exclusively for providing relief to the victims of earthquake in Gujarat; or",
  },
  {
    label: "(ix)",
    depth: 2,
    text: "any Zila Saksharta Samiti constituted in any district under the chairmanship of the Collector of that district for improving primary education in villages and towns having a population up to one lakh according to the last census of which figures are published before the first day of the relevant tax year, in such district and for literacy and post-literacy activities; or",
  },
  {
    label: "(x)",
    depth: 2,
    text: "the National Blood Transfusion Council or any State Blood Transfusion Council which has its sole object the control, supervision, regulation or encouragement in India of the services related to operation and requirements of blood banks; or",
  },
  {
    label: "(xi)",
    depth: 2,
    text: "any fund set up by a State Government to provide medical relief to the poor; or",
  },
  {
    label: "(xii)",
    depth: 2,
    text: "the Army Central Welfare Fund or the Indian Naval Benevolent Fund or the Air Force Central Welfare Fund established by the armed forces of the Union for the welfare of the past and present members of such forces or their dependants; or",
  },
  { label: "(xiii)", depth: 2, text: "the Andhra Pradesh Chief Minister’s Cyclone Relief Fund, 1996; or" },
  { label: "(xiv)", depth: 2, text: "the National Illness Assistance Fund; or" },
  {
    label: "(xv)",
    depth: 2,
    text: "the Chief Minister’s Relief Fund or the Lieutenant Governor’s Relief Fund, if the fund meets all the following conditions:—",
  },
  {
    label: "(A)",
    depth: 3,
    text: "it is the only fund of its kind established in the State or the Union territory;",
  },
  {
    label: "(B)",
    depth: 3,
    text: "it is under the overall control of the Chief Secretary or the Department of Finance of the respective State or the Union territory;",
  },
  {
    label: "(C)",
    depth: 3,
    text: "it is administered in a manner specified by the State Government or the Lieutenant Governor; or",
  },
  {
    label: "(xvi)",
    depth: 2,
    text: "the National Sports Development Fund set up by the Central Government; or",
  },
  { label: "(xvii)", depth: 2, text: "the National Cultural Fund set up by the Central Government; or" },
  {
    label: "(xviii)",
    depth: 2,
    text: "the Fund for Technology Development and Application set up by the Central Government; or",
  },
  {
    label: "(xix)",
    depth: 2,
    text: "the National Trust for Welfare of Persons with Autism, Cerebral Palsy, Mental Retardation and Multiple Disabilities constituted under section 3(1) of the National Trust for Welfare of Persons with Autism, Cerebral Palsy, Mental Retardation and Multiple Disabilities Act, 1999 (44 of 1999); or",
  },
  {
    label: "(xx)",
    depth: 2,
    text: "the Swachh Bharat Kosh, set up by the Central Government, other than the sum spent by the assessee in pursuance of Corporate Social Responsibility under section 135(5) of the Companies Act, 2013 (18 of 2013); or",
  },
  {
    label: "(xxi)",
    depth: 2,
    text: "the Clean Ganga Fund, set up by the Central Government, where such assessee is a resident and such sum is other than the sum spent by the assessee in pursuance of Corporate Social Responsibility under section 135(5) of the Companies Act, 2013 (18 of 2013); or",
  },
  {
    label: "(xxii)",
    depth: 2,
    text: "the National Fund for Control of Drug Abuse constituted under section 7A of the Narcotic Drugs and Psychotropic Substances Act, 1985 (61 of 1985); or",
  },
  {
    label: "(xxiii)",
    depth: 2,
    text: "the Government or to any such local authority, institution or association as may be approved in this behalf by the Central Government, to be utilised for the purpose of promoting family planning; or",
  },
  {
    label: "(xxiv)",
    depth: 2,
    text: "the Indian Olympic Association or any other association or institution established in India, as the Central Government may, having regard to the guidelines issued in this behalf, by notification, specify for the development of infrastructure for sports and games in India or the sponsorship of sports and games in India, by an assessee being a company;",
  },
  {
    label: "(b)",
    depth: 1,
    text: "an amount equal to 50% of the aggregate of the sums paid as donation by an assessee during the tax year to—",
  },
  { label: "(i)", depth: 2, text: "the Prime Minister’s Drought Relief Fund;" },
  {
    label: "(ii)",
    depth: 2,
    text: "any fund or any institution to which this section applies, if:—",
  },
  { label: "(A)", depth: 3, text: "it is established in India for a charitable purpose; and" },
  {
    label: "(B)",
    depth: 3,
    text: "it is a registered non-profit organisation or an institution or fund mentioned in Schedule VII (Table: Sl. No. 1) and approved under section 354;",
  },
  {
    label: "(iii)",
    depth: 2,
    text: "the Government or any local authority, to be utilised for any charitable purpose other than the purpose of promoting family planning;",
  },
  {
    label: "(iv)",
    depth: 2,
    text: "an authority constituted in India by or under any law enacted either for the purpose of dealing with and satisfying the need for housing accommodation or for the purpose of planning, development or improvement of cities, towns and villages, or for both;",
  },
  {
    label: "(v)",
    depth: 2,
    text: "a corporation established by the Central Government or any State Government for promoting the interests of the members of such minority community, as may be notified by the Central Government;",
  },
  {
    label: "(vi)",
    depth: 2,
    text: "any entity, for the renovation or repair of any temple, mosque, gurudwara, church or other place which is notified by the Central Government to be of historic, archaeological or artistic importance or to be a place of public worship of renown throughout any State or States.",
  },

  {
    label: "(2)",
    depth: 0,
    text: "Where the aggregate of the sums referred to in sub-section (1)(a)(xxiii) and (xxiv), and sub-section (1)(b)(ii) to (vi) exceeds 10% of the adjusted gross total income, then the amount in excess of 10% of the adjusted gross total income shall be ignored for the purpose of computing the aggregate of the sums in respect of which deduction is to be allowed under sub-section (1).",
  },
  {
    label: "(3)",
    depth: 0,
    text: "Where deduction under this section is claimed and allowed for any tax year in respect of any sum specified in sub-section (1), the sum in respect of which deduction is so allowed shall not qualify for deduction under any other provision of this Act for the same or any other tax year.",
  },
  {
    label: "(4)",
    depth: 0,
    text: "The deduction under this section shall be allowed only for donation made as a sum of money.",
  },
  {
    label: "(5)",
    depth: 0,
    text: "Any deduction for a donation over ₹ 2000 shall be allowed only if the payment is made by a mode other than cash.",
  },
  {
    label: "(6)",
    depth: 0,
    text: "Any claim of deduction by the assessee in his return of income filed for any tax year in case of a donation made to an institution or fund referred in sub-section (1)(b)(ii), shall be allowed—",
  },
  {
    label: "(a)",
    depth: 1,
    text: "only on the basis of the information relating to such donation furnished by such institution or fund to the prescribed authority or person authorised by such authority; and",
  },
  {
    label: "(b)",
    depth: 1,
    text: "subject to verification as per the risk management strategy formulated by the Board from time to time.",
  },
  { label: "(7)", depth: 0, text: "For the purposes of this section,—" },
  {
    label: "(a)",
    depth: 1,
    text: "“adjusted gross total income” means gross total income as reduced by any portion thereof on which income-tax is not payable under any provision of this Act and by any amount in respect of which the assessee is entitled to a deduction under any other provision of this Chapter;",
  },
  {
    label: "(b)",
    depth: 1,
    text: "“charitable purpose” does not include any purpose the whole or substantially the whole of which is of a religious nature;",
  },
  {
    label: "(c)",
    depth: 1,
    text: "“National Blood Transfusion Council” means a society registered under the Societies Registration Act, 1860 (21 of 1860) and has an officer of the rank of an Additional Secretary to the Government of India or higher to deal with the AIDS Control Project as its Chairman;",
  },
  {
    label: "(d)",
    depth: 1,
    text: "“State Blood Transfusion Council” means a society registered, in consultation with the National Blood Transfusion Council, under the Societies Registration Act, 1860 (21 of 1860) or under any law corresponding to that Act in force in any part of India and has a Secretary to the Government of that State dealing with the Department of Health, as its Chairman;",
  },
  {
    label: "(e)",
    depth: 1,
    text: "an association or institution having as its object the control, supervision, regulation or encouragement in India of such games or sports as may be notified by the Central Government, shall be deemed to be an institution established in India for a charitable purpose.",
  },
];
