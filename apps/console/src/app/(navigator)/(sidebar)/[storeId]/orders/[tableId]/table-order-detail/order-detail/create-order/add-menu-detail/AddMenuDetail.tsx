import { useCreateOrderContext } from "../CreateOrderProvider";
import AddedMenuList from "./added-menu-list/AddedMenuList";
import CreateOrderButton, {
  CloseDialogProps,
} from "./added-menu-list/CreateOrderButton";
import AddMenuDetailLayout from "./AddMenuDetailLayout";
import SelectedMenuDetail from "./SelectedMenuDetail";

export default function AddMenuDetail({ closeDialog }: CloseDialogProps) {
  const {
    state: { selectedMenu },
  } = useCreateOrderContext();

  if (selectedMenu) {
    return <SelectedMenuDetail />;
  }

  return (
    <AddMenuDetailLayout
      title={<CreateOrderTitle />}
      button={<CreateOrderButton closeDialog={closeDialog} />}
    >
      <AddedMenuList />
    </AddMenuDetailLayout>
  );
}

function CreateOrderTitle() {
  return <h3 className="font-bold text-xl px-2">추가한 주문</h3>;
}
