import * as React from "react";
import { Button, ButtonType } from "office-ui-fabric-react";
import Header from "./Header";
import HeroList, { HeroListItem } from "./HeroList";
import Progress from "./Progress";
// images references in the manifest
import "../../../assets/icon-16.png";
import "../../../assets/icon-32.png";
import "../../../assets/icon-80.png";
import { parse } from "../../domain/parser/language";
import { consistentAchors } from "../../domain/checker/consistentAnchors";
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

        const formulas = range.formulas;
        const parsedFormulae = formulas
          .filter(f => f !== null)
          .map(formula => formula as string[])
          .filter(f => f !== null)
          .map(f => parse(f[0]));

        var checkers = [consistentAchors];
        for (let i = 0; i < checkers.length; i++) {
          var checker = checkers[i];
          checker(parsedFormulae);
        }
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
