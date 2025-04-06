
import { ReactNode } from "react";

interface PaymentRequiredRouteProps {
  children: ReactNode;
}

const PaymentRequiredRoute = ({ children }: PaymentRequiredRouteProps) => {
  // No longer checking for subscription - passing through the children directly
  return <>{children}</>;
};

export default PaymentRequiredRoute;
