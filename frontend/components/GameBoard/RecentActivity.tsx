import React from "react";
import { Card } from "../ui/card";
import { DUMMY_RECENT_ACTIVITIES } from "@/lib/dummy";
import { BsSkipForwardCircleFill } from "react-icons/bs";
import { ImDice } from "react-icons/im";
import { RiMoneyDollarCircleFill } from "react-icons/ri";
import { AiFillCloseCircle } from "react-icons/ai";

const RecentActivity = () => {
  const recents = DUMMY_RECENT_ACTIVITIES;

  return (
    <Card className={"flex flex-col gap-3 px-4 py-2"}>
      <h4 className={"text-lg font-bold"}>
        Recent Activity</h4>

      <ul>
        {recents.map((activity, index) => {
          const icon =
            activity.type === "skip" ? (
              <BsSkipForwardCircleFill />
            ) : activity.type === "draw" ? (
              <ImDice />
            ) : activity.type === "bust" ? (
              <AiFillCloseCircle />
            ) : (
              <RiMoneyDollarCircleFill />
            );
          return (
            <li key={index} className={"flex items-center gap-2"}>
              <div>{icon}</div>
              <p>{activity.text}</p>
            </li>
          );
        })}
      </ul>
    </Card>
  );
};

export default RecentActivity;
