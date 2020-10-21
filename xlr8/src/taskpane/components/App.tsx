import * as React from "react";
import { Button, ButtonType } from "office-ui-fabric-react";
import Header from "./Header";
import HeroList, { HeroListItem } from "./HeroList";
import Progress from "./Progress";
// images references in the manifest
import "../../../assets/icon-16.png";
import "../../../assets/icon-32.png";
import "../../../assets/icon-80.png";
import { parse } from "../../domain/language";
/* global Button, console, Excel, Header, HeroList, HeroListItem, Progress */

export interface AppProps {
  title: string;
  isOfficeInitialized: boolean;
}

export interface AppState {
  listItems: HeroListItem[];
}

export default class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps, context: any) {
    super(props, context);
    this.state = {
      listItems: []
    };
  }

  componentDidMount() {
    this.setState({
      listItems: [
        {
          icon: "Ribbon",
          primaryText: "Achieve more with Office integration"
        },
        {
          icon: "Unlock",
          primaryText: "Unlock features and functionality"
        },
        {
          icon: "Design",
          primaryText: "Create and visualize like a pro"
        }
      ]
    });
  }

  click = async () => {
    try {
      await Excel.run(async context => {
        /**
         * Insert your Excel code here
         */
        const range = context.workbook.getSelectedRange();

        // Read the range address
        range.load("formulas");
        await context.sync();

        const formulae = [
          //   "hello",
          //   "123",
          //   "=A9",
          //   "=SUM(B6)",
          //   "=A4:A7",
          //   "=$B2",
          //   "=B$2",
          //   "=$B$2",
          //   "=A:A",
          //   "=SUM(A4:A7)",
          //   "=SUM(A:B)",
          //   "=IFERROR(B7, A3)",
          //   '=IFERROR(B7,"asd")',
          //   "=3+5",
          //   "=C19/2",
          //   "=C10/B7",
          //   "=SUM(C10:C12)*2",
          //   "=SUM(C10*5)",
          //   "=IFERROR(SUM(C13),10/2)",
          //   "IFERROR(SUM(C14),10/2)",
          //   "=SUM(C11 *5)",
          "=Sheet2!A1"
        ];
        for (let i = 0; i < formulae.length; i++) {
          const formula = formulae[i];
          const result = parse(formula);
          console.log(JSON.stringify(result));
        }
        //  const formulas = range.formulas;
        //  for (let i = 0; i < formulas.length; i++) {
        //    const formula = formulas[i];
        //    if (formula === null) continue;
        //    const f = formula as string[];
        //    if (f === null) {console.log(f); continue;}
        //    const firstFormula = f[0];
        //    if (firstFormula === "") continue;

        //  }

        // Update the fill color
        // range.format.fill.color = "green";

        await context.sync();

        // console.log(`The range address was ${range.address}.`);
      });
    } catch (error) {
      console.error(error);
    }
  };

  render() {
    const { title, isOfficeInitialized } = this.props;

    if (!isOfficeInitialized) {
      return (
        <Progress title={title} logo="assets/logo-filled.png" message="Please sideload your addin to see app body." />
      );
    }

    return (
      <div className="ms-welcome">
        <Header logo="assets/logo-filled.png" title={this.props.title} message="Welcome" />
        <HeroList message="Discover what Office Add-ins can do for you today!" items={this.state.listItems}>
          <p className="ms-font-l">
            Modify the source files, then click <b> Run </b>.{" "}
          </p>{" "}
          <Button
            className="ms-welcome__action"
            buttonType={ButtonType.hero}
            iconProps={{
              iconName: "ChevronRight"
            }}
            onClick={this.click}
          >
            Run{" "}
          </Button>{" "}
        </HeroList>{" "}
      </div>
    );
  }
}
