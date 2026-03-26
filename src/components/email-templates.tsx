import * as React from "react";

interface VerifyEmailTamplateProps {
  url: string;
  username: string;
}

export function VerifyEmailTamplate({
  url,
  username,
}: VerifyEmailTamplateProps) {
  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "40px auto",
        background: "#ffffff",
        padding: "24px",
        borderRadius: "8px",
        border: "1px solid #000",
        color: "#000",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ color: "#000" }}>Hello, {username}!</h1>

      <p>
        Welcome to <strong>NeuroPost</strong>. Please verify your email to
        activate your account.
      </p>

      <p>
        Click the button below to verify your email. The link expires in{" "}
        <strong>15 minutes</strong>.
      </p>

      <a
        href={url}
        style={{
          display: "inline-block",
          padding: "12px 20px",
          margin: "20px 0",
          background: "#000",
          color: "#fff",
          textDecoration: "none",
          borderRadius: "5px",
          fontWeight: "bold",
        }}
      >
        Verify Email
      </a>

      <p style={{ fontSize: "12px", color: "#555" }}>
        If you did not create a NeuroPost account, you can safely ignore this
        email.
      </p>

      <hr
        style={{
          margin: "30px 0",
          border: "none",
          borderTop: "1px solid #000",
        }}
      />

      <footer style={{ fontSize: "12px", color: "#555" }}>
        NeuroPost – social media platform for sharing your thoughts.
        {/* <br />
        Need help? Contact{" "}
        <a href="mailto:support@neuropost.com" style={{ color: "#000" }}>
          support@neuropost.com
        </a> */}
      </footer>
    </div>
  );
}

export function EmailChangeTemplate({ code }: { code: number }) {
  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "40px auto",
        background: "#ffffff",
        padding: "24px",
        borderRadius: "8px",
        border: "1px solid #000",
        color: "#000",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ color: "#000" }}>Email Change Request</h1>

      <p>
        We received a request to change the email address associated with your
        account. Please use the verification code below to confirm this change.
      </p>

       <p>
        The code expires in{" "}
        <strong>15 minutes</strong>.
      </p>

      <p style={{ fontSize: "24px", fontWeight: "bold", margin: "20px 0" }}>
        {code}
      </p>

      <p style={{ fontSize: "12px", color: "#555" }}>
        If you did not request this change, please ignore this email.
      </p>

      <hr
        style={{
          margin: "30px 0",
          border: "none",
          borderTop: "1px solid #000",
        }}
      />

      <footer style={{ fontSize: "12px", color: "#555" }}>
        NeuroPost – social media platform for sharing your thoughts.
      </footer>
    </div>
  );
}
