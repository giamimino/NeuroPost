"use client";
import { redirect } from "next/navigation";
import React from "react";

const SettingsPage = () => {
  redirect("/profile/settings/profile");
};

export default SettingsPage;
