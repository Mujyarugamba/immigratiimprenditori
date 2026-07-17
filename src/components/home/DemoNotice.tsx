import { Container } from "@/components/ui/Container";

export function DemoNotice() {
  return (
    <div className="border-line bg-brand-soft/70 border-b">
      <Container className="py-2">
        <p className="text-brand-dark text-center text-xs sm:text-left">
          Contenuti dimostrativi: le schede mostrate sono di esempio e non
          rappresentano pubblicazioni reali.
        </p>
      </Container>
    </div>
  );
}
