import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    slug: "cycle-equilibre",
    name: "Cycle Équilibré",
    tagline: "Apaise les phases lutéale et menstruelle",
    description:
      "Un complexe pensé pour accompagner les variations hormonales du cycle. Combine vitex, magnésium bisglycinate et oméga-3 pour réduire les inconforts prémenstruels et soutenir l'humeur tout au long du mois.",
    priceCents: 3490,
    subscriptionPriceCents: 2990,
    imageUrl:
      "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=1200&q=80",
    capsules: 60,
    servingSize: "2 gélules par jour",
    category: "cycle",
    goals: "cycle,mood,energy",
    featured: true,
    ingredients: [
      { name: "Vitex agnus-castus", dosage: "400 mg", benefit: "Régulation hormonale" },
      { name: "Magnésium bisglycinate", dosage: "300 mg", benefit: "Réduction des tensions" },
      { name: "Vitamine B6", dosage: "1.4 mg", benefit: "Métabolisme hormonal" },
      { name: "Oméga-3 EPA/DHA", dosage: "500 mg", benefit: "Anti-inflammatoire naturel" }
    ]
  },
  {
    slug: "energie-feminine",
    name: "Énergie Féminine",
    tagline: "Endurance et vitalité quotidiennes",
    description:
      "Pensé pour les journées denses, ce complexe associe fer hautement biodisponible, vitamines B et adaptogènes pour soutenir l'énergie sans excitation. Idéal en phase folliculaire et ovulatoire.",
    priceCents: 3290,
    subscriptionPriceCents: 2790,
    imageUrl:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1200&q=80",
    capsules: 60,
    servingSize: "1 gélule le matin",
    category: "energy",
    goals: "energy,immunity,focus",
    featured: true,
    ingredients: [
      { name: "Fer bisglycinate", dosage: "14 mg", benefit: "Lutte contre la fatigue" },
      { name: "Rhodiola rosea", dosage: "200 mg", benefit: "Adaptogène" },
      { name: "Vitamine B12", dosage: "2.5 µg", benefit: "Énergie cellulaire" },
      { name: "Vitamine C liposomale", dosage: "80 mg", benefit: "Absorption du fer" }
    ]
  },
  {
    slug: "sommeil-profond",
    name: "Sommeil Profond",
    tagline: "Endormissement et nuits réparatrices",
    description:
      "Un mélange doux à base de mélatonine, magnésium et plantes apaisantes pour favoriser un endormissement rapide et un sommeil de qualité, sans dépendance.",
    priceCents: 2990,
    subscriptionPriceCents: 2490,
    imageUrl:
      "https://images.unsplash.com/photo-1611073615452-4889bd9786d2?auto=format&fit=crop&w=1200&q=80",
    capsules: 30,
    servingSize: "1 gélule 30 min avant le coucher",
    category: "sleep",
    goals: "sleep,calm,recovery",
    featured: true,
    ingredients: [
      { name: "Mélatonine", dosage: "1 mg", benefit: "Endormissement" },
      { name: "Magnésium marin", dosage: "200 mg", benefit: "Détente musculaire" },
      { name: "Mélisse", dosage: "150 mg", benefit: "Apaise le mental" },
      { name: "L-théanine", dosage: "100 mg", benefit: "Calme nerveux" }
    ]
  },
  {
    slug: "peau-eclat",
    name: "Peau & Éclat",
    tagline: "Hydratation et luminosité",
    description:
      "Soutient la qualité de la peau de l'intérieur grâce au collagène marin, à l'acide hyaluronique et au zinc. Idéal en cure de 3 mois.",
    priceCents: 3890,
    subscriptionPriceCents: 3290,
    imageUrl:
      "https://images.unsplash.com/photo-1556228852-80b6e5eeff06?auto=format&fit=crop&w=1200&q=80",
    capsules: 90,
    servingSize: "3 gélules par jour",
    category: "skin",
    goals: "skin,hair,collagen",
    featured: false,
    ingredients: [
      { name: "Collagène marin Type I", dosage: "1500 mg", benefit: "Élasticité de la peau" },
      { name: "Acide hyaluronique", dosage: "120 mg", benefit: "Hydratation" },
      { name: "Zinc", dosage: "10 mg", benefit: "Régulation sébum" },
      { name: "Vitamine E", dosage: "12 mg", benefit: "Antioxydant" }
    ]
  },
  {
    slug: "immunite-bouclier",
    name: "Immunité Bouclier",
    tagline: "Renforce les défenses naturelles",
    description:
      "Une synergie de vitamines D3 et C, de zinc et d'extraits de plantes pour soutenir un système immunitaire robuste, surtout aux changements de saison.",
    priceCents: 2790,
    subscriptionPriceCents: 2390,
    imageUrl:
      "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80",
    capsules: 60,
    servingSize: "2 gélules par jour",
    category: "immunity",
    goals: "immunity,energy",
    featured: false,
    ingredients: [
      { name: "Vitamine D3", dosage: "25 µg", benefit: "Système immunitaire" },
      { name: "Vitamine C", dosage: "500 mg", benefit: "Antioxydant" },
      { name: "Zinc bisglycinate", dosage: "15 mg", benefit: "Défenses naturelles" },
      { name: "Échinacée", dosage: "200 mg", benefit: "Soutien immunitaire" }
    ]
  },
  {
    slug: "hormones-serenes",
    name: "Hormones Sereines",
    tagline: "Périménopause et bien-être hormonal",
    description:
      "Spécialement formulé pour les femmes entrant en périménopause : sauge officinale, maca et oméga-3 pour une transition plus douce.",
    priceCents: 4290,
    subscriptionPriceCents: 3690,
    imageUrl:
      "https://images.unsplash.com/photo-1626202373052-9cd8e7e2a5e2?auto=format&fit=crop&w=1200&q=80",
    capsules: 60,
    servingSize: "2 gélules par jour",
    category: "hormones",
    goals: "hormones,mood,sleep",
    featured: false,
    ingredients: [
      { name: "Sauge officinale", dosage: "300 mg", benefit: "Confort thermique" },
      { name: "Maca bio", dosage: "500 mg", benefit: "Tonus hormonal" },
      { name: "Oméga-3 EPA/DHA", dosage: "500 mg", benefit: "Équilibre nerveux" },
      { name: "Vitamine E", dosage: "12 mg", benefit: "Antioxydant" }
    ]
  }
];

const reviews = [
  {
    productSlug: "cycle-equilibre",
    authorName: "Camille L.",
    rating: 5,
    title: "Une vraie différence",
    body: "Au bout de deux mois je ressens beaucoup moins de tensions avant mes règles. Le packaging est superbe en plus."
  },
  {
    productSlug: "cycle-equilibre",
    authorName: "Anaïs R.",
    rating: 4,
    title: "Très bon produit",
    body: "Effet progressif mais réel sur l'humeur. J'aurais aimé un format plus économique."
  },
  {
    productSlug: "energie-feminine",
    authorName: "Julie M.",
    rating: 5,
    title: "Adieu coup de barre",
    body: "Plus besoin de café à 15h. Je le prends avec mon petit-déj et j'ai un vrai regain de tonus."
  },
  {
    productSlug: "sommeil-profond",
    authorName: "Sophie B.",
    rating: 5,
    title: "Endormissement rapide",
    body: "Je m'endors en 15 minutes au lieu d'une heure. Je le recommande vraiment."
  },
  {
    productSlug: "peau-eclat",
    authorName: "Léa D.",
    rating: 4,
    title: "Peau plus lumineuse",
    body: "Au bout de 6 semaines mon teint est plus uniforme. Texture des gélules agréable."
  },
  {
    productSlug: "immunite-bouclier",
    authorName: "Marion T.",
    rating: 5,
    title: "Hiver tranquille",
    body: "Aucun rhume depuis que je le prends. Je continuerai en cure saisonnière."
  },
  {
    productSlug: "hormones-serenes",
    authorName: "Hélène P.",
    rating: 5,
    title: "Transition plus douce",
    body: "Les bouffées de chaleur ont nettement diminué. Composition irréprochable."
  }
];

async function main() {
  console.log("🌱 Seeding…");
  await prisma.review.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.product.deleteMany();

  for (const p of products) {
    const { ingredients, ...data } = p;
    await prisma.product.create({
      data: {
        ...data,
        ingredients: { create: ingredients }
      }
    });
  }

  for (const r of reviews) {
    const product = await prisma.product.findUnique({ where: { slug: r.productSlug } });
    if (!product) continue;
    await prisma.review.create({
      data: {
        productId: product.id,
        authorName: r.authorName,
        rating: r.rating,
        title: r.title,
        body: r.body
      }
    });
  }

  console.log("✅ Seed terminé.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
