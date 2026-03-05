import { ComponentType } from "react";

type AnyObject = Record<string, unknown>;

export function withViewModel<ViewProps extends AnyObject, ViewModelProps extends AnyObject>(
    View: ComponentType<ViewProps & ViewModelProps>,
    useViewModel: (props: ViewProps) => ViewModelProps
) {
    return function ViewWithViewModel(props: ViewProps) {
        const viewModelProps = useViewModel(props);

        return <View {...props} {...viewModelProps} />;
    };
}
