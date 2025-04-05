
import { ReactNode } from "react";

interface PaymentRequiredRouteProps {
  children: ReactNode;
}

const PaymentRequiredRoute = ({ children }: PaymentRequiredRouteProps) => {
  // No longer checking for subscription - just passing through the children
  return <>{children}</>;
};

export default PaymentRequiredRoute;
