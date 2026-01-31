import React from "react";

const Title = ({ title, font, text }: { title: string; font?: string, text?: string }) => {
  return (
    <h1 className={`text-white font-bold `} style={{ font: `var(${font})`, fontSize: `var(${text || "--text-2xl"})` }}>
      {title}
    </h1>
  );
};

export default Title;
