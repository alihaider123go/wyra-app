import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { createAdminClient, createClient } from "@/utils/supabase/client";
import { signOut } from "@/actions/auth";

const reasonsMap: Record<string, { message: string; action: "stay" | "deactivate"; buttonText: string }> = {
  "Bored / Not fun anymore": {
    message:
      "Let’s spice things up! Have you checked out the Trending Wyras lately? Or joined a Circle? There’s always a juicy debate waiting for you.",
    action: "stay",
    buttonText: "Continue on Wyra",
  },
  "I don’t understand how to use Wyra": {
    message:
      "No worries — Wyra’s meant to be simple and fun. Would you rather… watch a quick 1-minute tutorial or poke around at your own pace? Either way, you’ll be posting like a pro in no time.",
    action: "stay",
    buttonText: "Continue on Wyra",
  },
  "Too many notifications": {
    message:
      "We get it — dings can be a drag. You can tweak your notification settings anytime in your profile. Silence what you don’t care about and keep just the good stuff.",
    action: "stay",
    buttonText: "Continue on Wyra",
  },
  "Don’t feel connected to people here": {
    message:
      "Your vibe attracts your tribe. Try following a few more users or joining Circles that match your interests. Your people are already here — go find them!",
    action: "stay",
    buttonText: "Continue on Wyra",
  },
  "Privacy concerns": {
    message:
      "We take your privacy seriously. You’re always in control of what you share and who sees it. Check out our privacy settings to fine-tune your experience.",
    action: "stay",
    buttonText: "Continue on Wyra",
  },
  "Just need a break": {
    message:
      "We hear you. Sometimes you just need to unplug. Instead of deleting, you can simply deactivate your account for now — and come back when you’re ready.",
    action: "deactivate",
    buttonText: "Deactivate Instead",
  },
  Other: {
    message:
      "Thanks for letting us know — we’d love to hear your feedback. But remember, Wyra is always evolving, and so is your experience. Why not stick around a little longer?",
    action: "stay",
    buttonText: "Continue on Wyra",
  },
};

const DeleteAccountButton = () => {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [stage, setStage] = useState<"select" | "suggestion" | "final" | "stay">("select");

  const handleFinalDelete = async () => {
    setLoading(true);
    const supabase = await createClient();
    const adminSupabase = await createAdminClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      alert("No user found.");
      setLoading(false);
      return;
    }

    const email = user.email;

    const { error } = await supabase.from("user_profiles").delete().eq("id", user.id);
    const { error:supabaseError } = await adminSupabase.auth.admin.deleteUser(user.id);

    if (error) {
      alert("Error deleting: " + error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setIsModalOpen(false);
    await signOut();
  };

  const handleFinalDeactivate = async () => {
    setLoading(true);
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      alert("No user found.");
      setLoading(false);
      return;
    }

    await supabase.from("user_profiles").update({ status: "deactivate" }).eq("email", user.email);
    setLoading(false);
    setIsModalOpen(false);
    await signOut();
  };

  const handleMainAction = () => {
    const action = reasonsMap[selectedReason]?.action;
    if (action === "deactivate") {
      handleFinalDeactivate();
    } else {
      setStage("stay");
    }
  };

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)} className="bg-red-600 hover:bg-red-600 text-lg text-bold text-white dark:text-black w-full h-12">
        <Trash2 className="w-4 h-4 mr-2" /> Delete Account
      </Button>

      <Modal isOpen={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open);
        if (!open) {
          setStage("select");
          setSelectedReason("");
        }
      }}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="text-center">
                {stage === "select"
                  ? "We’d hate to see you go"
                  : stage === "suggestion"
                    ? "Before you leave..."
                    : stage === "final"
                      ? "Are you sure?"
                      : "We're Glad You're Staying!"}
              </ModalHeader>

              <ModalBody>
                {stage === "select" && (
                  <>
                    <p className="text-center mb-4">
                      What’s making you want to leave Wyra?
                    </p>
                    <div className="flex flex-col gap-2">
                      {Object.keys(reasonsMap).map((reason) => (
                        <label key={reason} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="reason"
                            value={reason}
                            checked={selectedReason === reason}
                            onChange={() => setSelectedReason(reason)}
                          />
                          <span>{reason}</span>
                        </label>
                      ))}
                    </div>
                  </>
                )}

                {stage === "suggestion" && selectedReason && (
                  <div className="text-center">
                    <p className="mb-4">{reasonsMap[selectedReason]?.message}</p>
                    <Button onClick={handleMainAction}>
                      {reasonsMap[selectedReason]?.buttonText}
                    </Button>
                    <p className="mt-4 text-sm text-gray-500 dark:text-gray-200">
                      Still want to delete your account?{" "}
                      <button
                        className="text-red-600 hover:text-red-600 underline"
                        onClick={() => setStage("final")}
                      >
                        Delete Anyway
                      </button>
                    </p>
                  </div>
                )}

                {stage === "final" && (
                  <div className="text-center">
                    <p className="mb-2">
                      Are you sure? You can always choose to deactivate instead — it lets you take a
                      break without losing your posts, messages, and followers.
                    </p>
                    <div className="flex flex-col gap-2 mt-4">
                      <Button
                        className="bg-yellow-500 hover:bg-yellow-500 text-white dark:text-black"
                        onClick={handleFinalDeactivate}
                      >
                        Deactivate Instead
                      </Button>
                      <Button
                        className="bg-red-600 hover:bg-red-600 text-white dark:text-black"
                        onClick={handleFinalDelete}
                        disabled={loading}
                      >
                        {loading ? "Deleting..." : "Delete Anyway"}
                      </Button>
                    </div>
                  </div>
                )}

                {stage === "stay" && (
                  <p className="text-center">
                    🎉 Glad you decided to stay — we’d rather have you with us than without!
                    <br />
                    Now go fire up some fresh Wyras and keep the fun rolling.
                  </p>
                )}
              </ModalBody>

              <ModalFooter>
                {stage === "select" && selectedReason && (
                  <Button onClick={() => setStage("suggestion")} className="ml-auto">
                    Continue
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default DeleteAccountButton;
