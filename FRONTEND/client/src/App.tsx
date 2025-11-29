import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import TestChakra from "@/pages/TestChakra";
import AdminDashboard from "@/pages/AdminDashboard";
import GuruDashboard from "@/pages/GuruDashboard";
import KepsekDashboard from "@/pages/KepsekDashboard";
import KelasDetailPage from "@/pages/KelasDetailPage";
import JurnalPage from "@/pages/JurnalPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/test" element={<TestChakra />} />

      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/guru" element={<GuruDashboard />} />
      <Route path="/kepsek" element={<KepsekDashboard />} />
      
      <Route path="/kelas/:kelasId" element={<KelasDetailPage />} />
      <Route path="/jurnal" element={<JurnalPage />} />
    </Routes>
  );
}