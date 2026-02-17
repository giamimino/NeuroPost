import React, { useEffect, useRef, useState } from "react";
import Line from "../ui/Line";
import { Button } from "../ui/button";
import { PenLine } from "lucide-react";
import Image from "next/image";
import { CardTitle } from "../ui/card";
import { ImageValidator } from "@/utils/imageValidator";
import { ApiConfig } from "@/configs/api-configs";

const ProfileUpload = ({
  profile_url,
  save,
}: {
  profile_url: string;
  save: (signedUrl: string) => void;
}) => {
  const imageUploadRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<File | string>(profile_url);
  const [changed, setChanged] = useState(false);

  const uploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = ImageValidator(file);
    if (error) {
      alert(error);
      return;
    }

    setImage(file);
  };

  const handleSave = async () => {
    if (!changed || !image || image === "/user.jpg") return;

    const formData = new FormData();
    formData.append("file", image);

    const res = await fetch("/api/user/profile", {
      ...ApiConfig.postForm,
      body: formData,
    });
    const data = await res.json();
    if (data.ok) {
      const signRes = await fetch("/api/r2/image", {
        ...ApiConfig.post,
        body: JSON.stringify({ image_url: data.image }),
      });
      const signedUrl = await signRes.json();
      if (signedUrl.ok) {
        save(signedUrl.profileImage)
      }
    }
  };

  const pickFile = () => {
    imageUploadRef.current?.click();
  };

  useEffect(() => {
    if (image !== profile_url && !changed) {
      setChanged(true);
    } else if (image == (profile_url || "/user.jpg") && changed) {
      setChanged(false);
    }
  }, [image]);

  return (
    <div className="flex flex-col">
      <div className="flex">
        <CardTitle className="sm:w-25 lg:w-1/5">Profile photo</CardTitle>
        <div>
          <input
            type="file"
            accept={"image/png, image/jpeg, image/jpg, image/webp"}
            hidden
            ref={imageUploadRef}
            onChange={uploadImage}
          />
          <div className="relative">
            {image !== "" && (
              <Image
                src={
                  typeof image === "string" ? image : URL.createObjectURL(image)
                }
                width={96}
                height={96}
                alt="edit_profile"
                className="rounded-full object-cover w-24 h-24"
              />
            )}
            <Button
              variant={"secondary"}
              onClick={pickFile}
              size={"icon-sm"}
              className="rounded-full absolute right-0 bottom-0 hover:bg-secondary border border-primary cursor-pointer"
            >
              <PenLine />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex gap-3 font-plusJakartaSans justify-end">
        <Button variant={"secondary"} className="cursor-pointer">
          Cancel
        </Button>
        <Button
          variant={!changed ? "disabled" : "destructive"}
          className={`${changed ? "cursor-pointer" : ""}`}
          onClick={changed ? handleSave : undefined}
        >
          Save
        </Button>
      </div>
      <Line className="mt-5" />
    </div>
  );
};

export default ProfileUpload;
