"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers"; 
import { error } from "console";



export async function getUserSession() {
  const supabase = await createClient();
  const { data,error } = await supabase.auth.getUser();

  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }

  return {status: "success", user: data?.user};
}



export async function signUp(formData: FormData) {
  const supabase = await createClient();
  
  const firstname = formData.get("firstname")?.toString() || "";
  const lastname = formData.get("lastname")?.toString() || "";
  const dob = formData.get("dob")?.toString() || "";
  const email = formData.get("email")?.toString() || "";
  const password = formData.get("password")?.toString() || "";

  if (!email || !password) {
    return { status: "Email and password are required" };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        firstname,
        lastname,
        dob,
      },
    },
  });

  if (error) {
    return { status: error.message,user: null };
  }else if(data?.user?.identities?.length === 0) {
    return { status: "User with this email already exists, Please login !!!", user: null };
  }

  revalidatePath("/","layout");
  return { status: "success", user: data.user };
}



export async function signIn(formData: FormData) {
  const supabase = await createClient();
  
  const email = formData.get("email")?.toString() || "";
  const password = formData.get("password")?.toString() || "";

  if (!email || !password) {
    return { status: "Email and password are required" };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { status: error?.message, user: null };
  }

  const {data:existingUser} = await supabase.from("user_profiles").select("*").eq("email", email).limit(1).single();
  if (!existingUser) {
    const {error:insertError} = await supabase.from("user_profiles").insert({
      email: data.user.email,
      firstname: data.user.user_metadata.firstname || "",
      lastname: data.user.user_metadata.lastname || "",
      dob: data.user.user_metadata.dob || "",
    });
    if(insertError){
      return { status: insertError?.message, user: null };
    }
  }

  revalidatePath("/","layout");
  return { status: "success", user: data.user };
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    redirect("/error");
    // return { status: error.message };
  }

  revalidatePath("/","layout");
  redirect("/login");
}



export async function forgotPassword(formData: FormData) {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");;
  const email = formData.get("email")?.toString() || "";

  if (!email) {
    return { status: "Email is required" };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email,{redirectTo: `${origin}/reset-password`});

  if (error) {
    return { status: error.message };
  }

  return { status: "success" };
}



export async function resetPassword(formData: FormData,code: string) {
  const supabase = await createClient();
  
  const {error:CodeError} = await supabase.auth.exchangeCodeForSession(code);
  if (CodeError) {
    return { status: CodeError?.message };
  }


  const newPassword = formData.get("password")?.toString() || "";
    console.log(newPassword)

  const{error} = await supabase.auth.updateUser({
    password: newPassword,
  });
  
  if (error) {
    return { status: error?.message };
  }

  // revalidatePath("/","layout");
  return { status: "success" };
}