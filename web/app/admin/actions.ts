"use server"

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function handleAction(formData: FormData) {
    try {
        const s = await createClient();
        const intent = formData.get("intent");
        const table = formData.get("table") as string;
        const id = formData.get("id");

        // 1. DELETAR (FOTO, VÍDEO, SERVIÇO OU PRODUTO)
        if (intent === "delete") {
            if (table === "gallery") {
                const { data: item } = await s.from("gallery").select("url").eq("id", id).single();
                if (item?.url) {
                    const filePath = item.url.split("/gallery/").pop();
                    if (filePath) await s.storage.from("gallery").remove([filePath]);
                }
            } else if (table === "products") {
                const { data: item } = await s.from("products").select("image_url").eq("id", id).single();
                if (item?.image_url) {
                    const filePath = item.image_url.split("/gallery/").pop();
                    if (filePath) await s.storage.from("gallery").remove([filePath]);
                }
            }

            const { error } = await s.from(table).delete().eq("id", id);
            if (error) throw error;

            // 2. SUBIR FOTO OU VÍDEO (GALERIA)
        } else if (intent === "upload_media" || intent === "upload_image") {
            const file = formData.get("file") as File;
            const mediaType = intent === "upload_image" ? "PHOTO" : formData.get("type") as string;

            if (!file || file.size === 0) throw new Error("Arquivo vazio.");
            if (file.size > 52428800) throw new Error("Arquivo muito grande! Máximo 50MB.");

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${mediaType.toLowerCase()}s/${fileName}`;

            const { error: uploadError } = await s.storage.from("gallery").upload(filePath, file, { duplex: 'half' });
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = s.storage.from("gallery").getPublicUrl(filePath);
            await s.from("gallery").insert({ url: publicUrl, type: mediaType });

            // 3. SERVIÇOS
        } else if (intent === "create_svc") {
            await s.from("services").insert({
                name: formData.get("n"),
                price: parseFloat(formData.get("p") as string),
                duration_min: parseInt(formData.get("d") as string),
            });
        } else if (intent === "update_svc") {
            await s.from("services").update({
                name: formData.get("n"),
                price: parseFloat(formData.get("p") as string),
                duration_min: parseInt(formData.get("d") as string),
            }).eq("id", id);

            // 4. PRODUTOS
        } else if (intent === "create_prod") {
            const file = formData.get("file") as File;
            let productImageUrl = "";

            if (file && file.size > 0) {
                if (file.size > 10485760) throw new Error("Foto muito grande! Máximo 10MB.");
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `products/${fileName}`;
                const { error: uploadError } = await s.storage.from("gallery").upload(filePath, file, { duplex: 'half' });
                if (uploadError) throw uploadError;
                const { data: { publicUrl } } = s.storage.from("gallery").getPublicUrl(filePath);
                productImageUrl = publicUrl;
            }

            await s.from("products").insert({
                name: formData.get("n"),
                price: parseFloat(formData.get("p") as string),
                image_url: productImageUrl,
            });
        } else if (intent === "update_prod") {
            const file = formData.get("file") as File;
            const updateData: any = {
                name: formData.get("n"),
                price: parseFloat(formData.get("p") as string),
            };

            if (file && file.size > 0) {
                if (file.size > 10485760) throw new Error("Foto muito grande! Máximo 10MB.");
                // Deletar foto antiga se existir
                const { data: oldProd } = await s.from("products").select("image_url").eq("id", id).single();
                if (oldProd?.image_url) {
                    const oldPath = oldProd.image_url.split("/gallery/").pop();
                    if (oldPath) await s.storage.from("gallery").remove([oldPath]);
                }

                // Subir nova foto
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
                const filePath = `products/${fileName}`;
                const { error: uploadError } = await s.storage.from("gallery").upload(filePath, file, { duplex: 'half' });
                if (uploadError) throw uploadError;
                const { data: { publicUrl } } = s.storage.from("gallery").getPublicUrl(filePath);
                updateData.image_url = publicUrl;
            }

            await s.from("products").update(updateData).eq("id", id);

            // 5. CONFIGURAÇÕES
        } else if (intent === "update_settings") {
            const key = formData.get("key") as string;
            const value = formData.get("value") as string;
            await s.from('settings').upsert({ key, value }, { onConflict: 'key' });
            revalidatePath('/');
            revalidatePath('/admin');
        }

        revalidatePath('/');
        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        console.error("Erro na Action:", error);
        return { success: false, error: error.message };
    }
}