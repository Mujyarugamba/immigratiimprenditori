import type { Metadata } from "next";
import HomePage from "@/components/home/HomePage";
import "@/components/home/home-v2.css";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default HomePage;
