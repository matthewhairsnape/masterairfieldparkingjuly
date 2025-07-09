import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Payment from "@/pages/payment";
import Admin from "@/pages/admin";
import MobileLookup from "@/pages/mobile-lookup";
import Confirmation from "@/pages/confirmation";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/payment" component={Payment} />
      <Route path="/admin" component={Admin} />
      <Route path="/mobile-lookup" component={MobileLookup} />
      <Route path="/confirmation" component={Confirmation} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </div>
    </QueryClientProvider>
  );
}

export default App;
