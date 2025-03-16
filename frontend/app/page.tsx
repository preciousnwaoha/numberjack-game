import EnterGame from "@/components/StartScreens/EnterGame";
import { GameProvider } from "@/context/GameContext";

export default function Home() {
  

  return (
    <GameProvider>
      <main>
        <EnterGame />
      </main>
    </GameProvider>
  );
}
