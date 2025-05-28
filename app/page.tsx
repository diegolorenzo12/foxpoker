import SolitaireGame from "@/components/solitaire-game"
import Image from "next/image"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 bg-emerald-800">
      <div className="w-full max-w-5xl">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-white/90 p-4 rounded-lg shadow-lg mb-2 w-64">
            <Image
              src="/images/fox-poker-logo.png"
              alt="FoxPocker Logo"
              width={250}
              height={150}
              className="w-full h-auto"
              priority
            />
          </div>
          <h1 className="text-3xl font-bold text-white text-center">Solitaire</h1>
        </div>
        <SolitaireGame />
      </div>
    </main>
  )
}
