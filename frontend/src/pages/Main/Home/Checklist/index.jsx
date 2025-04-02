import React, { useState, useEffect } from "react";
import ManageWorkspace, {
  useManageWorkspaceModal,
} from "@/components/Modals/ManageWorkspace";
import NewWorkspaceModal, {
  useNewWorkspaceModal,
} from "@/components/Modals/NewWorkspace";
import Workspace from "@/models/workspace";
import { useNavigate } from "react-router-dom";
import paths from "@/utils/paths";
import {
  ChecklistItem,
  CHECKLIST_STORAGE_KEY,
  useChecklistItems,
} from "../../checklist";

export const CHECKLIST_HIDDEN = "anythingllm_checklist_dismissed";

export default function Checklist() {
  const [isHidden, setIsHidden] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const navigate = useNavigate();
  const checklistItems = useChecklistItems();

  const {
    showModal: showNewWsModal,
    hideModal: hideNewWsModal,
    showing: showingNewWsModal,
  } = useNewWorkspaceModal();
  const { showModal: showManageWsModal, hideModal: hideManageWsModal } =
    useManageWorkspaceModal();

  useEffect(() => {
    const hidden = window.localStorage.getItem(CHECKLIST_HIDDEN);
    setIsHidden(!!hidden);

    const stored = window.localStorage.getItem(CHECKLIST_STORAGE_KEY);
    if (stored) {
      const completedItems = JSON.parse(stored);
      setCompletedCount(Object.keys(completedItems).length);
    }
  }, []);

  const handleClose = () => {
    window.localStorage.setItem(CHECKLIST_HIDDEN, "true");
    setIsHidden(true);
  };

  const updateCompletedCount = () => {
    const stored = window.localStorage.getItem(CHECKLIST_STORAGE_KEY);
    if (stored) {
      const completedItems = JSON.parse(stored);
      setCompletedCount(Object.keys(completedItems).length);
    }
  };

  const handlers = {
    sendChat: async () => {
      const workspaces = await Workspace.all();
      if (workspaces.length > 0) {
        navigate(paths.workspace.chat(workspaces[0].slug));
      }
    },
    embedDocument: async () => {
      const workspaces = await Workspace.all();
      if (workspaces.length > 0) {
        setSelectedWorkspace(workspaces[0]);
        showManageWsModal();
      }
    },
    createWorkspace: () => {
      showNewWsModal();
    },
    setSlashCommand: async () => {
      const workspaces = await Workspace.all();
      if (workspaces.length > 0) {
        navigate(paths.workspace.chat(workspaces[0].slug));
        window.location.hash = "#slash-commands";
      }
    },
    setSystemPrompt: async () => {
      const workspaces = await Workspace.all();
      if (workspaces.length > 0) {
        navigate(paths.workspace.settings.chatSettings(workspaces[0].slug));
        window.location.hash = "#system-prompts";
      }
    },
    visitCommunityHub: () => {
      window.location.href = paths.communityHub.website();
    },
  };

  if (isHidden) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-x-3">
          <h1 className="text-white uppercase text-sm font-semibold">
            Getting Started
          </h1>
          {checklistItems.length - completedCount > 0 && (
            <p className="text-[#9F9FA0] text-xs">
              {checklistItems.length - completedCount} tasks left
            </p>
          )}
        </div>

        <div className="flex items-center gap-x-2">
          <button
            onClick={handleClose}
            className="text-white bg-[#1B1B1E] px-2 py-1 rounded-lg hover:bg-white/10 transition-colors text-xs"
          >
            close
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-white/20 p-4 lg:p-6 -mb-6 bg-[#211F22]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {checklistItems.map((item) => (
            <ChecklistItem
              key={item.id}
              {...item}
              onAction={() => {
                handlers[item.handler]();
                updateCompletedCount();
              }}
            />
          ))}
        </div>
      </div>
      {showingNewWsModal && <NewWorkspaceModal hideModal={hideNewWsModal} />}
      {selectedWorkspace && (
        <ManageWorkspace
          providedSlug={selectedWorkspace.slug}
          hideModal={() => {
            setSelectedWorkspace(null);
            hideManageWsModal();
          }}
        />
      )}
    </div>
  );
}
