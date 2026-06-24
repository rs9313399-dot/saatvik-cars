import { db } from '@/lib/db';

interface SeedPost {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: 'Guides' | 'Maintenance' | 'News' | 'Reviews' | 'Updates';
  tags: string;
  coverImage: string;
  author: string;
  publishedAt: Date;
}

const AUTHOR = 'Saatvik Cars Team';

// Spread publishedAt across the last 60 days, newest first.
// Base "now" is captured once at module load.
const NOW = Date.now();
const DAYS = 24 * 60 * 60 * 1000;
const daysAgo = (n: number): Date => new Date(NOW - n * DAYS);

const SEED_POSTS: SeedPost[] = [
  {
    title: '10 Things to Check Before Buying a Used Car',
    slug: '10-things-to-check-before-buying-a-used-car',
    excerpt:
      'A pre-purchase inspection checklist every Indian used-car buyer should follow — from RC and insurance papers to engine bay, tyres, and a thorough test drive.',
    category: 'Guides',
    tags: 'buying-guide,checklist,inspection',
    coverImage: '',
    author: AUTHOR,
    publishedAt: daysAgo(2),
    body: `Buying a used car can save you serious money, but only if you avoid a lemon. At Saatvik Cars we inspect every vehicle on a 150-point checklist before it reaches our showroom floor. Here is a condensed version of that checklist you can run yourself.

## Papers First, Always
Start with the RC (Registration Certificate). Match the chassis and engine numbers stamped on the RC with the physical numbers on the car. Verify there is no hypothecation (HP) entry, or if there is, that a NOC from the bank is attached. Also confirm insurance validity and check for any pending challans on the Parivahan portal.

## Under the Hood
Open the bonnet and look for oil leaks around the head gasket, oil pan, and timing cover. Pull the dipstick — the oil should be amber to dark brown, never milky (a milky sludge means coolant is mixing with oil, a sign of a blown head gasket). Check the coolant level and colour; rusty coolant hints at neglected maintenance.

## Tyres and Suspension
Tyres should have at least 3 mm of tread depth across the entire face. Uneven wear on the inner or outer edge points to wheel alignment or suspension issues. Push down hard on each corner of the car — it should rebound once and settle, not bounce.

## Brake and Electrical Test
During the test drive, brake firmly from 60 km/h on a flat, empty road. The car should stop in a straight line without pulling or squealing. Test every electrical — power windows, wipers, horn, AC, headlights, indicators, and the infotainment system. A dead battery is cheap; a fried wiring harness is not.

## Final Paperwork
Insist on a proper sale agreement, original RC, original insurance, pollution certificate (PUC), and the original invoice if available. At Saatvik Cars we handle RC transfer end-to-end so you can drive home worry-free.`,
  },
  {
    title: "How to Maintain Your Car's Engine for Long Life",
    slug: 'how-to-maintain-your-cars-engine-for-long-life',
    excerpt:
      'Simple, proven engine maintenance habits that add years to your car\'s life — oil change intervals, filter swaps, coolant checks, and driving techniques that protect your investment.',
    category: 'Maintenance',
    tags: 'engine,maintenance,tips',
    coverImage: '',
    author: AUTHOR,
    publishedAt: daysAgo(9),
    body: `Your engine is the most expensive single component in your car. Treat it well and it will easily cross 2 lakh kilometres without major work. Skip maintenance and you will be shopping for a rebuild far sooner than you think.

## Follow the Service Schedule
Every car has a manufacturer-recommended service interval, usually 10,000 km or 12 months, whichever is earlier. Stick to it religiously. Delaying a service by even 2,000 km can let old oil lose its lubricity, accelerating wear on camshafts and bearings.

## Oil and Filter Changes
Engine oil degrades with heat and time. Use the grade specified in your owner manual — switching to a "thicker" oil to reduce noise is a myth that often starves the top end of lubrication on cold starts. Replace the oil filter at every oil change; a clogged filter bypasses unfiltered oil straight to the engine.

## Keep the Cooling System Healthy
Check coolant level every fortnight when the engine is cold. Top up only with the manufacturer-recommended coolant, never plain water — water causes corrosion and boils over at lower temperatures. If your temperature gauge ever crosses the midpoint, stop immediately and let the engine cool before investigating.

## Air Filter and Fuel Filter
A clogged air filter chokes the engine, dropping fuel efficiency by up to 10 percent. Inspect it at every service and replace it every 20,000 km or once a year in dusty Indian conditions. The fuel filter is often ignored but is critical — it prevents injector-clogging debris from reaching the combustion chamber.

## Drive Gently When Cold
Engines wear the most in the first 60 seconds after a cold start when oil has not yet circulated. Avoid revving above 2,500 rpm or hard acceleration until the temperature gauge starts moving. This single habit alone can add 50,000 km to your engine's life.`,
  },
  {
    title: 'Saatvik Cars Now Offers Free RC Transfer',
    slug: 'saatvik-cars-now-offers-free-rc-transfer',
    excerpt:
      'Good news for buyers — Saatvik Cars now includes free RC transfer on every used car purchased, handled end-to-end by our paperwork team. No more RTO queues.',
    category: 'Updates',
    tags: 'announcement,rc-transfer',
    coverImage: '',
    author: AUTHOR,
    publishedAt: daysAgo(17),
    body: `We are thrilled to announce that, effective immediately, every used car purchased from Saatvik Cars now includes free RC transfer as part of the deal. No hidden fees, no RTO queues, no paperwork headaches — we handle it all.

## Why RC Transfer Matters
The Registration Certificate is the legal proof of ownership for any vehicle in India. Until the RC is transferred to your name, you remain exposed to liability if the previous owner is involved in any dispute. Many buyers neglect this step, only to face problems at resale or during police verification.

## What We Handle
Our paperwork team takes care of the entire process — Form 28, 29, and 30 preparation, NOC procurement if the car is from another state, fee payment at the RTO, and follow-up until the new RC is dispatched to your address. You simply sign where needed and we do the rest.

## The Typical Timeline
In same-state transactions, RC transfer typically completes within 15 to 30 working days. For inter-state transfers requiring an NOC, allow 30 to 45 days. We keep you updated at every stage via WhatsApp and SMS, so you always know where your paperwork stands.

## Already Bought From Us?
If you bought a car from Saatvik Cars in the past 60 days and paid for RC transfer separately, reach out to our customer care — we will refund the RC transfer fee as a service credit. That is our promise of fair treatment for every customer, past and present.

## Visit Us Today
Drop by our showroom or call our team to learn more. With free RC transfer, free first service on select cars, and our 7-day return policy, there has never been a better time to buy a used car from Saatvik Cars.`,
  },
  {
    title: 'Hyundai Creta 2020 Review: Still the Best SUV?',
    slug: 'hyundai-creta-2020-review-still-the-best-suv',
    excerpt:
      'We drive a used 2020 Hyundai Creta SX (O) diesel-automatic and tell you whether this mid-size SUV is still the segment benchmark four years later.',
    category: 'Reviews',
    tags: 'hyundai,creta,suv,review',
    coverImage: '',
    author: AUTHOR,
    publishedAt: daysAgo(26),
    body: `The second-generation Hyundai Creta launched in 2020 and quickly became India's best-selling mid-size SUV. Four years on, with several new rivals in the segment, is a used 2020 Creta still the smart pick? We spent a week with a Creta SX (O) diesel-automatic to find out.

## Design and Presence
The 2020 redesign was polarising, but in person the Creta carries real road presence. The split headlamp setup, cascading grille, and squared wheel arches give it a chunky, SUV stance that the Kia Seltos — its platform sibling — cannot quite match. Our test car in Titan Grey with diamond-cut alloys still turned heads.

## Cabin and Features
Step inside and you understand why the Creta sells. The cabin feels a segment above in finish, with soft-touch materials on the doors and a clean layered dashboard. The 10.25-inch touchscreen, digital cluster, panoramic sunroof, ventilated front seats, and Bose audio make the SX (O) feel genuinely premium. Rear-seat legroom is generous and the boot, at 433 litres, swallows a family's luggage with ease.

## Engine and Drive
The 1.5-litre diesel makes 115 hp and 250 Nm, paired here with a 6-speed torque-converter automatic. It is not the quietest diesel at idle, but on the move it settles into a relaxed hum. The gearbox is smooth around town and the turbo kicks in cleanly past 1,800 rpm. We measured a real-world 16 kmpl in mixed Mumbai driving — excellent for a car this size.

## Ride and Handling
Hyundai has tuned the suspension for comfort, and that shows. Potholes, speed breakers, and broken tarmac are dismissed with a soft, well-damped motion. The trade-off is body roll in fast corners — this is no driver's car. The steering is light and great for city parking but lacks feel at highway speeds.

## Verdict
Yes, the 2020 Creta is still the segment benchmark for most buyers. It is spacious, loaded with features, frugal, and holds its resale value better than rivals. A well-maintained used 2020 SX (O) diesel-automatic currently retails for around 12 to 13 lakh at Saatvik Cars — roughly 40 percent off its new-car price. That is exceptional value.`,
  },
  {
    title: '5 Tips to Get the Best Price When Selling Your Car',
    slug: '5-tips-to-get-the-best-price-when-selling-your-car',
    excerpt:
      'Maximise your car\'s resale value with these five practical tips — from cleaning and paperwork to timing the sale and avoiding lowball offers.',
    category: 'Guides',
    tags: 'selling,tips,valuation',
    coverImage: '',
    author: AUTHOR,
    publishedAt: daysAgo(38),
    body: `Selling your used car should not mean accepting the first lowball offer that comes your way. With a little preparation, you can often fetch 8 to 15 percent more than the typical trade-in quote. Here are five proven tips from our valuation desk.

## 1. Clean, Detail, and Fix the Small Stuff
First impressions set the price. A professional interior and exterior detail — including engine bay cleaning — instantly makes the car feel cared for. Fix the small things buyers notice: a cracked tail-light, a worn wiper blade, a sagging headliner. Spending 3,000 rupees here can add 15,000 to your final sale price.

## 2. Get All Papers in Order
Buyers — and dealers — discount heavily when papers are missing. Have the original RC, insurance, PUC, service book, and original invoice ready. If the RC has a bank hypothecation, get it removed before listing. A clean paper trail signals a clean car.

## 3. Time the Sale Right
Convertibles and SUVs sell slower during monsoon; entry-level hatchbacks sell faster in the festive season (October to November). Generally, the best time to list is the first two weeks of any month when buyers have fresh salaries. Avoid the year-end lull in December when resale values dip across the board.

## 4. Gather Service History
A documented service history from an authorised workshop is worth real money. It proves the car was maintained on schedule and lets the buyer trust the odo reading. If you serviced at a local garage, gather those bills and arrange them in a folder.

## 5. Get Multiple Quotes
Never accept the first offer. Get quotes from at least three sources — a dealer like Saatvik Cars, an online car-buying platform, and direct buyer leads. The spread between the lowest and highest offer is often 20 to 30 percent. Use the highest quote as leverage to negotiate the others up.

## Bonus: Consider a Trade-In
If you are upgrading, a trade-in can be quicker and tax-efficient. In many Indian states, you get an offset on the new car's road tax proportional to the old car's value. At Saatvik Cars we offer instant trade-in valuations and handle the entire swap in a single visit.`,
  },
  {
    title: 'Used Car Loan Interest Rates Explained',
    slug: 'used-car-loan-interest-rates-explained',
    excerpt:
      'Current used car loan interest rates in India, what affects your rate, and how to negotiate the lowest EMI. Plus a comparison of major lenders.',
    category: 'News',
    tags: 'finance,loan,rates',
    coverImage: '',
    author: AUTHOR,
    publishedAt: daysAgo(52),
    body: `Used car loan interest rates in India currently range from 9.5 percent to 14.5 percent per annum, depending on the lender, the car's age, your credit score, and the loan-to-value ratio. Understanding how each of these factors moves your rate can save you tens of thousands of rupees over the loan tenure.

## The Base Rate
The Reserve Bank's repo rate movements directly impact used car loan pricing. As of late 2024, most lenders price used car loans 3 to 6 percentage points above their marginal cost of funds-based lending rate (MCLR). This is why used car loans are typically 1.5 to 3 percentage points more expensive than new car loans from the same bank.

## Your Credit Score Matters Most
A CIBIL score above 750 unlocks the lowest advertised rates. Between 700 and 750, expect a 0.5 to 1 percent premium. Below 700, some lenders will still approve the loan but at 12 to 14 percent, and may require a guarantor. Always pull your own credit report (free once a year on RBI-mandated portals) before applying.

## Loan-to-Value Ratio
Lenders finance 70 to 90 percent of the agreed used car value. The lower your LTV (i.e., the larger your down payment), the lower your interest rate. Putting down 30 percent instead of the minimum 10 percent can drop your rate by 0.5 percent at most banks.

## Car Age and Tenure
Most lenders cap the loan tenure at "car age plus loan tenure equals 10 years". So a 4-year-old car can get a maximum 6-year loan. Older cars (8 years plus) attract a 1 to 2 percent rate premium and may need a co-applicant.

## Compare Before You Sign
We surveyed rates from major lenders this quarter. State Bank of India used car loans start at 9.55 percent, HDFC Bank at 10.00 percent, Axis Bank at 10.25 percent, and Bajaj Auto Finance at 11.50 percent. At Saatvik Cars we have tie-ups with three banks and can often negotiate a 0.25 to 0.50 percent concession on the card rate for our customers — talk to our finance desk before you sign anywhere else.`,
  },
];

/**
 * Seed 6 blog posts into the BlogPost table IF it is currently empty.
 * Idempotent — safe to run multiple times.
 */
async function main(): Promise<void> {
  if ((await db.blogPost.count()) > 0) {
    console.log('Blog posts already seeded');
    process.exit(0);
  }

  await db.blogPost.createMany({
    data: SEED_POSTS.map((p) => ({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt,
      body: p.body,
      category: p.category,
      tags: p.tags,
      coverImage: p.coverImage,
      author: p.author,
      published: true,
      views: 0,
      publishedAt: p.publishedAt,
    })),
  });

  console.log(`Seeded ${SEED_POSTS.length} blog posts`);
}

main()
  .catch((error) => {
    console.error('Blog seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
