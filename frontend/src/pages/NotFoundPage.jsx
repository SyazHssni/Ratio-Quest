import { Link } from "react-router-dom";
import { RafiAvatar } from "../components/rq/Rafi";

export default function NotFoundPage() {
  return (
    <div className="rq-card p-8 max-w-xl space-y-4" data-testid="not-found-page">
      <RafiAvatar size={72} mood="thinking" />
      <h1 className="font-heading text-3xl font-bold text-slate-900">Rafi can't find this page</h1>
      <p className="text-slate-700">This path is not on our map. Let's head back to the start.</p>
      <Link to="/" className="rq-btn-primary" data-testid="not-found-home-btn">
        Go Home
      </Link>
    </div>
  );
}
