"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@ssurak/ui/components/buttons/button";
import { CardContent, CardFooter } from "@ssurak/ui/components/layouts/card";
import { useForm } from "react-hook-form";
import SignInField from "../sign-in-field/SignInField";
import Link from "next/link";
import signInAction from "../../actions/signInAction";
import { useRouter } from "next/navigation";
import { SignInPayload } from "@ssurak/api/core/auth/auth.type";
import { signInPayloadSchema } from "@ssurak/api/schemas/signIn.schema";
import { useAuthInfo } from "@ssurak/auth/providers/AuthenticationProvider";
import { Spinner } from "@ssurak/ui/components/spinner";
import { resetRealtimeSocket } from "@/lib/realtime/socket";

export default function SignInFormCard() {
  const { setAuthInfo } = useAuthInfo();

  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignInPayload>({
    resolver: zodResolver(signInPayloadSchema),
    mode: "all",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async ({ email, password }: SignInPayload) => {
    const signInResult = await signInAction({ email, password });

    if (!signInResult.success) {
      setError("password", { message: signInResult.error?.message });
      return;
    }
    setAuthInfo({ accessToken: signInResult.data.accessToken });
    resetRealtimeSocket();
    router.replace("/");
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <CardContent>
        <div className="flex flex-col gap-2">
          <SignInField
            id="email"
            label="이메일"
            type="email"
            placeholder="demo@ssurak.com"
            errorMessage={errors.email && errors.email?.message}
            register={register}
          />
          <SignInField
            id="password"
            label="비밀번호"
            type="password"
            errorMessage={errors.password && errors.password?.message}
            register={register}
          />
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button
          type="submit"
          className="w-full font-bold"
          disabled={isSubmitting}
        >
          {isSubmitting ? <Spinner /> : "로그인"}
        </Button>
        <div className="flex items-center justify-between w-full">
          <div className="flex  gap-2">
            {/* TODO: Implement admin login functionality */}
            {/* <Checkbox name="isAdmin" id="isAdmin" defaultChecked={false} />
            <Label htmlFor="isAdmin" className="text-xs">
              관리자 로그인
            </Label> */}
          </div>
          <Link
            href="#"
            className="ml-auto inline-block text-xs underline-offset-4 hover:underline"
          >
            비밀번호를 잊으셨나요?
          </Link>
        </div>
      </CardFooter>
    </form>
  );
}
