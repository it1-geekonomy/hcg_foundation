// // // "use client";

// // // import Image from "next/image";
// // // import { useState } from "react";

// // // /** Put the woman/mother-daughter photo at: public/formimage.png */

// // // const AMOUNTS = ["₹3000", "₹5,000", "₹10,000", "₹15,000", "₹25,000"];

// // // const IMPACT_ITEMS = [
// // //   {
// // //     emoji: "🏥",
// // //     title: "Support Treatment",
// // //     desc: "Help fund critical cancer treatments",
// // //   },
// // //   {
// // //     emoji: "🤝",
// // //     title: "Care & Compassion",
// // //     desc: "Provide emotional and holistic care",
// // //   },
// // //   {
// // //     emoji: "💰",
// // //     title: "Financial Assistance",
// // //     desc: "Offer financial aid to families in need",
// // //   },
// // //   {
// // //     emoji: "❤️",
// // //     title: "Hope & Recovery",
// // //     desc: "Bring hope and strength for tomorrow",
// // //   },
// // // ];

// // // const TRUST_ITEMS = [
// // //   {
// // //     icon: "🛡️",
// // //     title: "80G Tax Exemption",
// // //     desc: "Get tax benefits on your donation",
// // //   },
// // //   {
// // //     icon: "📋",
// // //     title: "100% Transparent",
// // //     desc: "Your donation goes directly to those in need",
// // //   },
// // //   {
// // //     icon: "✅",
// // //     title: "Trusted & Verified",
// // //     desc: "HCG Foundation is a trusted organisation",
// // //   },
// // //   {
// // //     icon: "💛",
// // //     title: "Lives Impacted",
// // //     desc: "Your support helps thousands of lives",
// // //   },
// // // ];

// // // export default function OverlayForm({
// // //   onClose,
// // // }: {
// // //   onClose: () => void;
// // // }) {
// // //   const [selectedAmount, setSelectedAmount] = useState("₹3000");

// // //   return (
// // //     <DonationModal
// // //       selectedAmount={selectedAmount}
// // //       onSelectAmount={setSelectedAmount}
// // //       onClose={onClose}
// // //     />
// // //   );
// // // }

// // // /* ------------------------------------------------------------------ */
// // // /* Donation modal                                                      */
// // // /* ------------------------------------------------------------------ */

// // // function DonationModal({
// // //   selectedAmount,
// // //   onSelectAmount,
// // //   onClose,
// // // }: {
// // //   selectedAmount: string;
// // //   onSelectAmount: (amount: string) => void;
// // //   onClose: () => void;
// // // }) {
// // //   return (
// // //     <div
// // //       className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-black/60 backdrop-blur-sm"
// // //       role="dialog"
// // //       aria-modal="true"
// // //       aria-labelledby="donation-modal-title"
// // //     >
// // //       <div className="relative mx-auto my-4 flex w-[calc(100%-2rem)] max-w-[1400px] flex-col overflow-hidden bg-white shadow-2xl sm:my-6 sm:w-[calc(100%-3rem)] lg:my-12 lg:w-[calc(100%-6rem)] lg:flex-row xl:my-16 xl:w-[calc(100%-8rem)]">
// // //         {/* Close button */}
// // //         <button
// // //           onClick={onClose}
// // //           aria-label="Close donation form"
// // //           className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center bg-gray-900 text-white transition hover:bg-gray-700"
// // //         >
// // //           ✕
// // //         </button>

// // //         {/* Left: copy + form */}
// // //         <div className="flex w-full min-w-0 flex-col justify-center bg-gradient-to-br from-white via-white to-amber-50 px-8 py-10 lg:w-1/2 lg:px-12 lg:py-14">
// // //           <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
// // //             Together, we can
// // //           </p>

// // //           <h2
// // //             id="donation-modal-title"
// // //             className="mt-2 font-serif text-4xl leading-tight text-gray-900"
// // //           >
// // //             <span className="italic">Bring Hope</span>
// // //             <br />
// // //             <span className="italic text-amber-500">Beyond Cancer</span>
// // //           </h2>

// // //           <p className="mt-4 max-w-md text-sm leading-relaxed text-gray-500">
// // //             Your contribution helps provide life-saving treatment, emotional
// // //             care, and financial support to cancer patients and their
// // //             families in need.
// // //           </p>

// // //           {/* Impact grid */}
// // //           <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
// // //             {IMPACT_ITEMS.map((item) => (
// // //               <div key={item.title} className="flex min-w-0 items-start gap-3">
// // //                 <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-lg">
// // //                   {item.emoji}
// // //                 </span>
// // //                 <div className="min-w-0">
// // //                   <p className="text-sm font-semibold text-gray-900">
// // //                     {item.title}
// // //                   </p>
// // //                   <p className="text-xs leading-snug text-gray-400">
// // //                     {item.desc}
// // //                   </p>
// // //                 </div>
// // //               </div>
// // //             ))}
// // //           </div>

// // //           {/* Amount selector */}
// // //           <div className="mt-8">
// // //             <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
// // //               Choose an amount
// // //             </p>
// // //             <div className="mt-3 flex flex-wrap gap-2">
// // //               {AMOUNTS.map((amount) => {
// // //                 const active = amount === selectedAmount;
// // //                 return (
// // //                   <button
// // //                     key={amount}
// // //                     onClick={() => onSelectAmount(amount)}
// // //                     className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${active
// // //                       ? "border-gray-900 bg-gray-900 text-white"
// // //                       : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
// // //                       }`}
// // //                   >
// // //                     {amount}
// // //                   </button>
// // //                 );
// // //               })}
// // //               <button className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400">
// // //                 More
// // //               </button>
// // //             </div>
// // //           </div>

// // //           {/* Donate CTA */}
// // //           <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3.5 text-sm font-bold text-gray-900 shadow-sm transition hover:from-amber-500 hover:to-amber-600">
// // //             ❤️ DONATE NOW →
// // //           </button>
// // //           <p className="mt-2 text-center text-xs text-gray-400">
// // //             🔒 Secure Payment | Powered by Razorpay
// // //           </p>

// // //           {/* Trust row */}
// // //           <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-6 sm:grid-cols-4">
// // //             {TRUST_ITEMS.map((item) => (
// // //               <div key={item.title} className="flex min-w-0 flex-col gap-1">
// // //                 <span className="text-base">{item.icon}</span>
// // //                 <p className="text-xs font-semibold text-gray-900">
// // //                   {item.title}
// // //                 </p>
// // //                 <p className="text-[11px] leading-snug text-gray-400">
// // //                   {item.desc}
// // //                 </p>
// // //               </div>
// // //             ))}
// // //           </div>
// // //         </div>

// // //         {/* Right: photo */}
// // //         <div className="relative w-full bg-amber-50 lg:w-1/2">
// // //           <div className="relative aspect-[16/10] w-full lg:aspect-auto lg:h-full lg:min-h-[520px]">
// // //             <Image
// // //               src="/formimage.png"
// // //               alt="Cancer patient and her daughter embracing, both smiling"
// // //               fill
// // //               sizes="(min-width: 1024px) 50vw, 100vw"
// // //               className="object-contain"
// // //               priority
// // //             />
// // //             <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-transparent" />
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // "use client";

// // import Image from "next/image";
// // import { useState } from "react";

// // /** Put the woman/mother-daughter photo at: public/formimage.png */

// // const AMOUNTS = ["₹3000", "₹5,000", "₹10,000", "₹15,000", "₹25,000"];

// // const IMPACT_ITEMS = [
// //   {
// //     emoji: "🏥",
// //     title: "Support Treatment",
// //     desc: "Help fund critical cancer treatments",
// //   },
// //   {
// //     emoji: "🤝",
// //     title: "Care & Compassion",
// //     desc: "Provide emotional and holistic care",
// //   },
// //   {
// //     emoji: "💰",
// //     title: "Financial Assistance",
// //     desc: "Offer financial aid to families in need",
// //   },
// //   {
// //     emoji: "❤️",
// //     title: "Hope & Recovery",
// //     desc: "Bring hope and strength for tomorrow",
// //   },
// // ];

// // const TRUST_ITEMS = [
// //   {
// //     icon: "🛡️",
// //     title: "80G Tax Exemption",
// //     desc: "Get tax benefits on your donation",
// //   },
// //   {
// //     icon: "📋",
// //     title: "100% Transparent",
// //     desc: "Your donation goes directly to those in need",
// //   },
// //   {
// //     icon: "✅",
// //     title: "Trusted & Verified",
// //     desc: "HCG Foundation is a trusted organisation",
// //   },
// //   {
// //     icon: "💛",
// //     title: "Lives Impacted",
// //     desc: "Your support helps thousands of lives",
// //   },
// // ];

// // export default function OverlayForm({
// //   onClose,
// // }: {
// //   onClose: () => void;
// // }) {
// //   const [selectedAmount, setSelectedAmount] = useState("₹3000");

// //   return (
// //     <DonationModal
// //       selectedAmount={selectedAmount}
// //       onSelectAmount={setSelectedAmount}
// //       onClose={onClose}
// //     />
// //   );
// // }

// // /* ------------------------------------------------------------------ */
// // /* Donation modal                                                      */
// // /* ------------------------------------------------------------------ */

// // function DonationModal({
// //   selectedAmount,
// //   onSelectAmount,
// //   onClose,
// // }: {
// //   selectedAmount: string;
// //   onSelectAmount: (amount: string) => void;
// //   onClose: () => void;
// // }) {
// //   return (
// //     <div
// //       className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-black/60 backdrop-blur-sm"
// //       role="dialog"
// //       aria-modal="true"
// //       aria-labelledby="donation-modal-title"
// //     >
// //       <div className="relative mx-auto my-4 flex w-[calc(100%-2rem)] max-w-[1400px] flex-col overflow-hidden bg-white shadow-2xl sm:my-6 sm:w-[calc(100%-3rem)] lg:absolute lg:inset-12 lg:mx-0 lg:my-0 lg:w-auto lg:max-w-none lg:flex-row xl:inset-16">
// //         {/* Close button */}
// //         <button
// //           onClick={onClose}
// //           aria-label="Close donation form"
// //           className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center bg-gray-900 text-white transition hover:bg-gray-700"
// //         >
// //           ✕
// //         </button>

// //         {/* Left: copy + form */}
// //         <div className="flex w-full min-w-0 flex-col justify-center bg-gradient-to-br from-white via-white to-amber-50 px-8 py-10 lg:w-1/2 lg:px-12 lg:py-14">
// //           <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
// //             Together, we can
// //           </p>

// //           <h2
// //             id="donation-modal-title"
// //             className="mt-2 font-serif text-4xl leading-tight text-gray-900"
// //           >
// //             <span className="italic">Bring Hope</span>
// //             <br />
// //             <span className="italic text-amber-500">Beyond Cancer</span>
// //           </h2>

// //           <p className="mt-4 max-w-md text-sm leading-relaxed text-gray-500">
// //             Your contribution helps provide life-saving treatment, emotional
// //             care, and financial support to cancer patients and their
// //             families in need.
// //           </p>

// //           {/* Impact grid */}
// //           <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
// //             {IMPACT_ITEMS.map((item) => (
// //               <div key={item.title} className="flex min-w-0 items-start gap-3">
// //                 <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-lg">
// //                   {item.emoji}
// //                 </span>
// //                 <div className="min-w-0">
// //                   <p className="text-sm font-semibold text-gray-900">
// //                     {item.title}
// //                   </p>
// //                   <p className="text-xs leading-snug text-gray-400">
// //                     {item.desc}
// //                   </p>
// //                 </div>
// //               </div>
// //             ))}
// //           </div>

// //           {/* Amount selector */}
// //           <div className="mt-8">
// //             <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
// //               Choose an amount
// //             </p>
// //             <div className="mt-3 flex flex-wrap gap-2">
// //               {AMOUNTS.map((amount) => {
// //                 const active = amount === selectedAmount;
// //                 return (
// //                   <button
// //                     key={amount}
// //                     onClick={() => onSelectAmount(amount)}
// //                     className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${active
// //                       ? "border-gray-900 bg-gray-900 text-white"
// //                       : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
// //                       }`}
// //                   >
// //                     {amount}
// //                   </button>
// //                 );
// //               })}
// //               <button className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400">
// //                 More
// //               </button>
// //             </div>
// //           </div>

// //           {/* Donate CTA — fixed/specific size below 1024px, original full-width style at lg+ */}
// //           <button className="mt-6 flex w-fit items-center justify-center gap-2 self-start rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-10 py-3 text-sm font-bold text-gray-900 shadow-sm transition hover:from-amber-500 hover:to-amber-600 lg:w-full lg:self-auto lg:px-0 lg:py-3.5">
// //             ❤️ DONATE NOW →
// //           </button>
// //           <p className="mt-2 text-left lg:text-center text-xs text-gray-400">
// //             🔒 Secure Payment | Powered by Razorpay
// //           </p>

// //           {/* Trust row */}
// //           <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-6 sm:grid-cols-4">
// //             {TRUST_ITEMS.map((item) => (
// //               <div key={item.title} className="flex min-w-0 flex-col gap-1">
// //                 <span className="text-base">{item.icon}</span>
// //                 <p className="text-xs font-semibold text-gray-900">
// //                   {item.title}
// //                 </p>
// //                 <p className="text-[11px] leading-snug text-gray-400">
// //                   {item.desc}
// //                 </p>
// //               </div>
// //             ))}
// //           </div>
// //         </div>

// //         {/* Right: photo */}
// //         <div className="relative -mt-px w-full shrink-0 bg-amber-50 lg:mt-0 lg:w-1/2">
// //           <div className="relative aspect-[16/10] w-full lg:aspect-auto lg:h-full lg:min-h-[520px]">
// //             <Image
// //               src="/formimage.png"
// //               alt="Cancer patient and her daughter embracing, both smiling"
// //               fill
// //               sizes="(min-width: 1024px) 50vw, 100vw"
// //               className="object-contain"
// //               priority
// //             />
// //             <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-transparent" />
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// "use client";

// import Image from "next/image";
// import { useState } from "react";

// /** Put the woman/mother-daughter photo at: public/formimage.png */

// const AMOUNTS = ["₹3000", "₹5,000", "₹10,000", "₹15,000", "₹25,000"];

// const IMPACT_ITEMS = [
//   {
//     emoji: "🏥",
//     title: "Support Treatment",
//     desc: "Help fund critical cancer treatments",
//   },
//   {
//     emoji: "🤝",
//     title: "Care & Compassion",
//     desc: "Provide emotional and holistic care",
//   },
//   {
//     emoji: "💰",
//     title: "Financial Assistance",
//     desc: "Offer financial aid to families in need",
//   },
//   {
//     emoji: "❤️",
//     title: "Hope & Recovery",
//     desc: "Bring hope and strength for tomorrow",
//   },
// ];

// const TRUST_ITEMS = [
//   {
//     icon: "🛡️",
//     title: "80G Tax Exemption",
//     desc: "Get tax benefits on your donation",
//   },
//   {
//     icon: "📋",
//     title: "100% Transparent",
//     desc: "Your donation goes directly to those in need",
//   },
//   {
//     icon: "✅",
//     title: "Trusted & Verified",
//     desc: "HCG Foundation is a trusted organisation",
//   },
//   {
//     icon: "💛",
//     title: "Lives Impacted",
//     desc: "Your support helps thousands of lives",
//   },
// ];

// export default function OverlayForm({
//   onClose,
// }: {
//   onClose: () => void;
// }) {
//   const [selectedAmount, setSelectedAmount] = useState("₹3000");

//   return (
//     <DonationModal
//       selectedAmount={selectedAmount}
//       onSelectAmount={setSelectedAmount}
//       onClose={onClose}
//     />
//   );
// }

// /* ------------------------------------------------------------------ */
// /* Donation modal                                                      */
// /* ------------------------------------------------------------------ */

// function DonationModal({
//   selectedAmount,
//   onSelectAmount,
//   onClose,
// }: {
//   selectedAmount: string;
//   onSelectAmount: (amount: string) => void;
//   onClose: () => void;
// }) {
//   return (
//     <div
//       className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-black/60 backdrop-blur-sm"
//       role="dialog"
//       aria-modal="true"
//       aria-labelledby="donation-modal-title"
//     >
//       <div className="relative mx-auto my-4 flex w-[calc(100%-2rem)] max-w-[1400px] flex-col overflow-hidden bg-white shadow-2xl sm:my-6 sm:w-[calc(100%-3rem)] lg:absolute lg:inset-12 lg:mx-0 lg:my-0 lg:w-auto lg:max-w-none lg:flex-row lg:items-stretch xl:inset-16">
//         {/* Close button */}
//         <button
//           onClick={onClose}
//           aria-label="Close donation form"
//           className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center bg-gray-900 text-white transition hover:bg-gray-700"
//         >
//           ✕
//         </button>

//         {/* Left: copy + form */}
//         <div className="flex w-full min-w-0 flex-col justify-center bg-gradient-to-br from-white via-white to-amber-50 px-8 py-10 lg:w-1/2 lg:min-h-0 lg:justify-center lg:overflow-y-auto lg:px-12 lg:py-14">
//           <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
//             Together, we can
//           </p>

//           <h2
//             id="donation-modal-title"
//             className="mt-2 font-serif text-4xl leading-tight text-gray-900"
//           >
//             <span className="italic">Bring Hope</span>
//             <br />
//             <span className="italic text-amber-500">Beyond Cancer</span>
//           </h2>

//           <p className="mt-4 max-w-md text-sm leading-relaxed text-gray-500">
//             Your contribution helps provide life-saving treatment, emotional
//             care, and financial support to cancer patients and their
//             families in need.
//           </p>

//           {/* Impact grid */}
//           <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
//             {IMPACT_ITEMS.map((item) => (
//               <div key={item.title} className="flex min-w-0 items-start gap-3">
//                 <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-lg">
//                   {item.emoji}
//                 </span>
//                 <div className="min-w-0">
//                   <p className="text-sm font-semibold text-gray-900">
//                     {item.title}
//                   </p>
//                   <p className="text-xs leading-snug text-gray-400">
//                     {item.desc}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Amount selector */}
//           <div className="mt-8">
//             <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
//               Choose an amount
//             </p>
//             <div className="mt-3 flex flex-wrap gap-2">
//               {AMOUNTS.map((amount) => {
//                 const active = amount === selectedAmount;
//                 return (
//                   <button
//                     key={amount}
//                     onClick={() => onSelectAmount(amount)}
//                     className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${active
//                       ? "border-gray-900 bg-gray-900 text-white"
//                       : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
//                       }`}
//                   >
//                     {amount}
//                   </button>
//                 );
//               })}
//               <button className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400">
//                 More
//               </button>
//             </div>
//           </div>

//           {/* Donate CTA — fixed/specific size below 1024px, original full-width style at lg+ */}
//           <button className="mt-6 flex w-fit items-center justify-center gap-2 self-start rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-10 py-3 text-sm font-bold text-gray-900 shadow-sm transition hover:from-amber-500 hover:to-amber-600 lg:w-full lg:self-auto lg:px-0 lg:py-3.5">
//             ❤️ DONATE NOW →
//           </button>
//           <p className="mt-2 text-left lg:text-center text-xs text-gray-400">
//             🔒 Secure Payment | Powered by Razorpay
//           </p>

//           {/* Trust row */}
//           <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-6 sm:grid-cols-4">
//             {TRUST_ITEMS.map((item) => (
//               <div key={item.title} className="flex min-w-0 flex-col gap-1">
//                 <span className="text-base">{item.icon}</span>
//                 <p className="text-xs font-semibold text-gray-900">
//                   {item.title}
//                 </p>
//                 <p className="text-[11px] leading-snug text-gray-400">
//                   {item.desc}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Right: photo */}
//         <div className="relative -mt-px w-full shrink-0 bg-amber-50 lg:mt-0 lg:h-full lg:w-1/2">
//           <div className="relative aspect-[16/10] w-full lg:aspect-auto lg:h-full">
//             <Image
//               src="/formimage.png"
//               alt="Cancer patient and her daughter embracing, both smiling"
//               fill
//               sizes="(min-width: 1024px) 50vw, 100vw"
//               className="object-cover object-bottom lg:object-cover lg:object-bottom"
//               priority
//             />
//             <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-transparent" />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import Image from "next/image";
import { useState } from "react";

/** Put the woman/mother-daughter photo at: public/formimage.png */

const AMOUNTS = ["₹3000", "₹5,000", "₹10,000", "₹15,000", "₹25,000"];

const IMPACT_ITEMS = [
  {
    emoji: "🏥",
    title: "Support Treatment",
    desc: "Help fund critical cancer treatments",
  },
  {
    emoji: "🤝",
    title: "Care & Compassion",
    desc: "Provide emotional and holistic care",
  },
  {
    emoji: "💰",
    title: "Financial Assistance",
    desc: "Offer financial aid to families in need",
  },
  {
    emoji: "❤️",
    title: "Hope & Recovery",
    desc: "Bring hope and strength for tomorrow",
  },
];

const TRUST_ITEMS = [
  {
    icon: "🛡️",
    title: "80G Tax Exemption",
    desc: "Get tax benefits on your donation",
  },
  {
    icon: "📋",
    title: "100% Transparent",
    desc: "Your donation goes directly to those in need",
  },
  {
    icon: "✅",
    title: "Trusted & Verified",
    desc: "HCG Foundation is a trusted organisation",
  },
  {
    icon: "💛",
    title: "Lives Impacted",
    desc: "Your support helps thousands of lives",
  },
];

export default function OverlayForm({
  onClose,
}: {
  onClose: () => void;
}) {
  const [selectedAmount, setSelectedAmount] = useState("₹3000");

  return (
    <DonationModal
      selectedAmount={selectedAmount}
      onSelectAmount={setSelectedAmount}
      onClose={onClose}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Donation modal                                                      */
/* ------------------------------------------------------------------ */

function DonationModal({
  selectedAmount,
  onSelectAmount,
  onClose,
}: {
  selectedAmount: string;
  onSelectAmount: (amount: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-black/60 backdrop-blur-sm py-6 lg:py-12"
      role="dialog"
      aria-modal="true"
      aria-labelledby="donation-modal-title"
    >
      <div className="relative mx-auto my-4 flex w-[calc(100%-2rem)] max-w-[1400px] flex-col overflow-hidden bg-white shadow-2xl sm:my-6 sm:w-[calc(100%-3rem)] lg:absolute lg:inset-12 lg:mx-0 lg:my-auto lg:max-h-[860px] lg:w-auto lg:max-w-none lg:flex-row lg:items-stretch xl:inset-16">
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close donation form"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center bg-gray-900 text-white transition hover:bg-gray-700"
        >
          ✕
        </button>

        {/* Left: copy + form */}
        <div className="flex w-full min-w-0 flex-col justify-center bg-gradient-to-br from-white via-white to-amber-50 px-8 py-10 lg:w-1/2 lg:min-h-0 lg:justify-start lg:overflow-y-auto lg:px-12 lg:py-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Together, we can
          </p>

          <h2
            id="donation-modal-title"
            className="mt-2 font-serif text-4xl leading-tight text-gray-900"
          >
            <span className="italic">Bring Hope</span>
            <br />
            <span className="italic text-amber-500">Beyond Cancer</span>
          </h2>

          <p className="mt-4 max-w-md text-sm leading-relaxed text-gray-500">
            Your contribution helps provide life-saving treatment, emotional
            care, and financial support to cancer patients and their
            families in need.
          </p>

          {/* Impact grid */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {IMPACT_ITEMS.map((item) => (
              <div key={item.title} className="flex min-w-0 items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-lg">
                  {item.emoji}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {item.title}
                  </p>
                  <p className="text-xs leading-snug text-gray-400">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Amount selector */}
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              Choose an amount
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {AMOUNTS.map((amount) => {
                const active = amount === selectedAmount;
                return (
                  <button
                    key={amount}
                    onClick={() => onSelectAmount(amount)}
                    className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${active
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                      }`}
                  >
                    {amount}
                  </button>
                );
              })}
              <button className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-gray-400">
                More
              </button>
            </div>
          </div>

          {/* Donate CTA — fixed/specific size below 1024px, original full-width style at lg+ */}
          <button className="mt-6 flex w-fit items-center justify-center gap-2 self-start rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-10 py-3 text-sm font-bold text-gray-900 shadow-sm transition hover:from-amber-500 hover:to-amber-600 lg:w-full lg:self-auto lg:px-0 lg:py-3.5">
            ❤️ DONATE NOW →
          </button>
          <p className="mt-2 text-left lg:text-center text-xs text-gray-400">
            🔒 Secure Payment | Powered by Razorpay
          </p>

          {/* Trust row */}
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-6 sm:grid-cols-4">
            {TRUST_ITEMS.map((item) => (
              <div key={item.title} className="flex min-w-0 flex-col gap-1">
                <span className="text-base">{item.icon}</span>
                <p className="text-xs font-semibold text-gray-900">
                  {item.title}
                </p>
                <p className="text-[11px] leading-snug text-gray-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: photo */}
        <div className="relative -mt-px w-full shrink-0 bg-amber-50 lg:mt-0 lg:h-full lg:w-1/2">
          <div className="relative aspect-[16/10] w-full lg:aspect-auto lg:h-full">
            <Image
              src="/formimage.png"
              alt="Cancer patient and her daughter embracing, both smiling"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-bottom lg:object-cover lg:object-bottom"
              priority
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/40 via-transparent to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}