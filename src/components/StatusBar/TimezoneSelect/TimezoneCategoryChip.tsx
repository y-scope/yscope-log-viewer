import {Chip} from "@mui/joy";
import {DefaultColorPalette} from "@mui/joy/styles/types/colorSystem";

import {TIMEZONE_CATEGORY} from "../../../typings/date";

import "./TimezoneCategoryChip.css";


interface TimezoneTypeMetadata {
    label: string;
    color: DefaultColorPalette;
}

const TIMEZONE_CATEGORY_METADATA: Record<TIMEZONE_CATEGORY, TimezoneTypeMetadata> = {
    [TIMEZONE_CATEGORY.DEFAULT]: {
        label: "Default",
        color: "neutral",
    },
    [TIMEZONE_CATEGORY.BROWSER]: {
        label: "Browser",
        color: "warning",
    },
    [TIMEZONE_CATEGORY.LOGGER]: {
        label: "Logger",
        color: "primary",
    },
    [TIMEZONE_CATEGORY.MANUAL]: {
        label: "Manual",
        color: "success",
    },
};

interface TimezoneCategoryChipProps {
    category: TIMEZONE_CATEGORY;
    disabled: boolean;
}

/**
 * Render a chip that represents the category of the timezone.
 *
 * @param props
 * @param props.category
 * @param props.disabled
 * @return
 */
const TimezoneCategoryChip = ({
    category,
    disabled,
}: TimezoneCategoryChipProps) => {
    const isDefault = category === TIMEZONE_CATEGORY.DEFAULT;

    return (
        <Chip
            color={TIMEZONE_CATEGORY_METADATA[category].color}
            disabled={disabled}
            sx={{borderRadius: "xs"}}
            className={`timezone-category-chip ${isDefault ?
                "timezone-category-chip-default-timezone" :
                ""}`}
        >
            {"Timezone"}
            {false === isDefault && " | "}
            {false === isDefault && TIMEZONE_CATEGORY_METADATA[category].label}
        </Chip>
    );
};


export default TimezoneCategoryChip;
