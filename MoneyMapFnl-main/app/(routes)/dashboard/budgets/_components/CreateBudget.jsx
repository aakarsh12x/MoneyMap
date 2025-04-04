"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import EmojiPicker from "emoji-picker-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db } from "@/utils/dbConfig";
import { Budgets, UserSettings } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { CurrencySelector } from "@/components/ui/currency-selector";
import { eq } from "drizzle-orm";

function CreateBudget({ refreshData }) {
  const [emojiIcon, setEmojiIcon] = useState("😀");
  const [openEmojiPicker, setOpenEmojiPicker] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [loading, setLoading] = useState(false);

  const { user } = useUser();

  useEffect(() => {
    if (user) {
      loadUserCurrency();
    }
  }, [user]);

  /**
   * Load user's preferred currency
   */
  const loadUserCurrency = async () => {
    try {
      const userEmail = user?.primaryEmailAddress?.emailAddress;
      const result = await db
        .select()
        .from(UserSettings)
        .where(eq(UserSettings.userId, userEmail));
      
      if (result && result.length > 0) {
        setCurrency(result[0].baseCurrency);
      }
    } catch (error) {
      console.error("Error loading user currency:", error);
    }
  };

  /**
   * Used to Create New Budget
   */
  const onCreateBudget = async () => {
    try {
      setLoading(true);
      const result = await db
        .insert(Budgets)
        .values({
          name: name,
          amount: amount,
          createdBy: user?.primaryEmailAddress?.emailAddress,
          icon: emojiIcon,
          currency: currency,
        })
        .returning({ insertedId: Budgets.id });

      if (result) {
        refreshData();
        toast("New Budget Created!");
        setName("");
        setAmount("");
        setCurrency("INR");
      }
    } catch (error) {
      console.error("Error creating budget:", error);
      toast.error("Failed to create budget");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border p-5 rounded-2xl cursor-pointer hover:border-primary transition-all duration-300">
      <Dialog>
        <DialogTrigger className="w-full">
          <div className="h-[130px] flex items-center justify-center flex-col">
            <h2 className="font-bold">Create New Budget</h2>
            <h2 className="text-5xl">+</h2>
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Budget</DialogTitle>
            <DialogDescription>
              Create your new budget with all details here
            </DialogDescription>
          </DialogHeader>

          <div>
            <div className="mt-2">
              <h2 className="text-black font-medium my-1">Icon</h2>
              <div
                onClick={() => setOpenEmojiPicker(!openEmojiPicker)}
                className="border p-5 rounded-lg flex justify-center"
              >
                <h2 className="text-4xl">{emojiIcon}</h2>
              </div>
              {openEmojiPicker && (
                <div className="mt-2">
                  <EmojiPicker
                    onEmojiClick={(item) => {
                      setEmojiIcon(item.emoji);
                      setOpenEmojiPicker(false);
                    }}
                  />
                </div>
              )}
            </div>
            <div className="mt-2">
              <h2 className="text-black font-medium my-1">Budget Name</h2>
              <Input
                placeholder="e.g. Personal Expense"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="mt-2">
              <h2 className="text-black font-medium my-1">Budget Amount</h2>
              <Input
                placeholder="e.g. 1000"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="mt-2">
              <h2 className="text-black font-medium my-1">Currency</h2>
              <CurrencySelector 
                value={currency}
                onChange={setCurrency}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                disabled={!(name && amount) || loading}
                onClick={() => onCreateBudget()}
                className="mt-3 w-full rounded-full"
              >
                {loading ? "Creating..." : "Create New Budget"}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateBudget;
