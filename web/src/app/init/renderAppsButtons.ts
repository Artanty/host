import { ProductButton, Remotes } from "../app.component.types";

export function renderProductMainButton (
    projectId: string, 
    remotes: Remotes, 
    buttonsArr: ProductButton[]
): void {
    buttonsArr.push({
      projectId: projectId, 
      imgSrcBaseUrl: remotes[projectId].url,
      buttonName: remotes[projectId].buttonName,
      buttonTitle: remotes[projectId].buttonTitle,
      routerPath: remotes[projectId].routerPath,
      buttonState: 'initial'
    })
  }