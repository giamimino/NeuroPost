import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle } from "lucide-react";

const AlertContainer = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  return (
    <Alert variant={"destructive"} className="max-w-md">
      <AlertCircle />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
};

export default AlertContainer;
