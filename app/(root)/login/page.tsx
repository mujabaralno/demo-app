import LoginForm from "@/components/auth/LoginForm";
import Image from "next/image";
export default function Home() {
  return (
    <div className="flex w-full mx-auto justify-center items-center bg-white ">
      <div className="grid grid-cols-2 w-full">
        <div className="w-full flex justify-center items-center">
        <LoginForm />
        </div>
        <div className="w-full">
          <Image 
          src="/project.jpg"
          alt="bg-auth"
          width={1200}
          height={1200}
          priority
          className="object-cover w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}
