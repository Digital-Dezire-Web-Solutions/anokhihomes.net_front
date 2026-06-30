import comp from "../../Assets/Compass/compass.png";
import NiPlotcolor from "../../icons/ni-plotcolor";
import { PLOT_COLORS } from "./plotStyles";

export default function Compass() {
    return (
        <>
            <div className="plot-compass">
                <img src={comp} alt="" />
            </div>
            <div className="plot-colors">
                <span style={{background: PLOT_COLORS["FOR_SALE"]}}> <NiPlotcolor/> For Sale</span>
                <span style={{background: PLOT_COLORS["HOLD"]}}> <NiPlotcolor/> Hold</span>
                <span style={{background: PLOT_COLORS["SOLD"]}}> <NiPlotcolor/> Sold</span>
                <span style={{background: PLOT_COLORS["PENDING"]}}> <NiPlotcolor/> Pending</span>
                <span style={{background: PLOT_COLORS["NOT_FOR_SALE"]}}> <NiPlotcolor/> Not For Sale</span>
                <span style={{background: PLOT_COLORS["ROAD"]}}> <NiPlotcolor/> Road</span>
            </div>

        </>
    );
}
