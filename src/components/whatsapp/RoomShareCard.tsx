import { motion } from "framer-motion";
import {
  Share2,
  Copy,
  Download,
  Eye,
  MapPin,
  BedDouble,
  IndianRupee,
  Phone,
  Wifi,
  Wind,
  Droplets,
  Car,
  Camera,
  UtensilsCrossed,
} from "lucide-react";
import { inr, roomShareCard } from "./whatsappData";

interface Props {
  onToast: (m: string) => void;
}

const facilityIcons: Record<string, typeof Wifi> = {
  WiFi: Wifi,
  AC: Wind,
  "Hot Water": Droplets,
  Parking: Car,
  CCTV: Camera,
  Kitchen: UtensilsCrossed,
};

export default function RoomShareCard({ onToast }: Props) {
  return (
    <section>
      <div className="min-w-0">
        <h2 className="flex items-center gap-2 text-base font-extrabold text-ink-900">
          <Share2 className="h-4.5 w-4.5 text-primary-600" /> Room Sharing
        </h2>
        <p className="mt-0.5 text-sm text-ink-500">
          StayHub's signature feature — beautiful shareable room cards.
        </p>
      </div>

      <div className="mt-4 grid gap-6 xl:grid-cols-2">
        {/* Share card preview */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-glow"
        >
          {/* Image */}
          <div className="relative h-44 overflow-hidden bg-ink-100">
            <img
              src={roomShareCard.image}
              alt={roomShareCard.property}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
              <div>
                <p className="text-lg font-extrabold text-white">{roomShareCard.property}</p>
                <p className="flex items-center gap-1 text-xs text-white/80">
                  <MapPin className="h-3 w-3" /> Bangalore, Indiranagar
                </p>
              </div>
              <span className="rounded-full bg-success-500 px-3 py-1 text-xs font-bold text-white">
                {roomShareCard.availableBeds} Beds Available
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="p-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-primary-50 p-3">
                <p className="flex items-center gap-1 text-xs font-medium text-primary-600">
                  <BedDouble className="h-3.5 w-3.5" /> Room
                </p>
                <p className="mt-1 text-lg font-bold text-primary-900">Room {roomShareCard.room}</p>
              </div>
              <div className="rounded-xl bg-success-50 p-3">
                <p className="flex items-center gap-1 text-xs font-medium text-success-600">
                  <IndianRupee className="h-3.5 w-3.5" /> Rent Per Bed
                </p>
                <p className="mt-1 text-lg font-bold text-success-900">
                  {inr(roomShareCard.rentPerBed)}/mo
                </p>
              </div>
            </div>

            {/* Facilities */}
            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-ink-400">
              Facilities
            </p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {roomShareCard.facilities.map((f) => {
                const Icon = facilityIcons[f] ?? Wifi;
                return (
                  <div
                    key={f}
                    className="flex items-center gap-1.5 rounded-lg bg-ink-50 px-2.5 py-2 text-xs font-semibold text-ink-700"
                  >
                    <Icon className="h-3.5 w-3.5 text-primary-500" /> {f}
                  </div>
                );
              })}
            </div>

            {/* Owner contact */}
            <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-ink-100 bg-ink-50 p-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white">
                P
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-ink-500">Owner Contact</p>
                <p className="flex items-center gap-1 text-sm font-bold text-ink-900">
                  <Phone className="h-3.5 w-3.5 text-primary-600" /> {roomShareCard.ownerContact}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-ink-100 bg-ink-50 px-5 py-3">
            <span className="text-xs font-bold text-ink-500">Powered by StayHub</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary-600 text-xs font-black text-white">
              S
            </span>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex flex-col justify-center gap-4">
          <div className="rounded-2xl border border-primary-200 bg-primary-50 p-5">
            <p className="text-sm font-bold text-primary-900">Share this room card</p>
            <p className="mt-1 text-xs text-primary-700">
              Send a beautiful room advertisement directly through WhatsApp. Tenants see the
              property, available beds, rent and facilities — all in one card.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => onToast("Room card shared on WhatsApp")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-success-600 px-4 py-3 text-sm font-bold text-white shadow-float transition-all hover:-translate-y-0.5 hover:bg-success-700"
            >
              <Share2 className="h-4 w-4" /> Share on WhatsApp
            </button>
            <button
              onClick={() => onToast("Link copied to clipboard")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm font-bold text-ink-800 transition-all hover:border-primary-200 hover:text-primary-700"
            >
              <Copy className="h-4 w-4" /> Copy Link
            </button>
            <button
              onClick={() => onToast("PDF download started")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm font-bold text-ink-800 transition-all hover:border-primary-200 hover:text-primary-700"
            >
              <Download className="h-4 w-4" /> Download PDF
            </button>
            <button
              onClick={() => onToast("Preview opened")}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm font-bold text-ink-800 transition-all hover:border-primary-200 hover:text-primary-700"
            >
              <Eye className="h-4 w-4" /> Preview
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-white p-3 text-center shadow-card">
              <p className="text-lg font-extrabold text-ink-900">12</p>
              <p className="text-[10px] font-semibold uppercase text-ink-400">Times Shared</p>
            </div>
            <div className="rounded-xl bg-white p-3 text-center shadow-card">
              <p className="text-lg font-extrabold text-ink-900">8</p>
              <p className="text-[10px] font-semibold uppercase text-ink-400">Inquiries</p>
            </div>
            <div className="rounded-xl bg-white p-3 text-center shadow-card">
              <p className="text-lg font-extrabold text-success-600">3</p>
              <p className="text-[10px] font-semibold uppercase text-ink-400">Tenants Found</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
