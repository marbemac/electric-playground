import { RootStoreContext, createRootStore } from "./stores/root.ts";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const rootStore = createRootStore();

  return (
    <RootStoreContext.Provider value={rootStore}>
      {children}
    </RootStoreContext.Provider>
  );
};
