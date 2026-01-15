import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log("Seeding products...");

    const products = [
        {
            name: "Pomada Modeladora Matte",
            price: 45.00,
            image_url: "https://images.unsplash.com/photo-1598453123307-5d07c082cb79?auto=format&fit=crop&q=80&w=400&h=400"
        },
        {
            name: "Óleo para Barba Premium",
            price: 35.00,
            image_url: "https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?auto=format&fit=crop&q=80&w=400&h=400"
        },
        {
            name: "Shampoo Refrescante 2 em 1",
            price: 50.00,
            image_url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=400&h=400"
        }
    ];

    for (const prod of products) {
        const { error } = await supabase.from("products").insert(prod);
        if (error) {
            console.error(`Error inserting ${prod.name}:`, error.message);
        } else {
            console.log(`Successfully inserted ${prod.name}`);
        }
    }
}

seed();
