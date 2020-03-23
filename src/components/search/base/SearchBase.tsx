import * as React from "react";
import ISearchFilterBaseProps from "./props/ISearchFilterBaseProps";
import { Search, SearchProps, SearchResultData } from "semantic-ui-react";
import ISearchFilterBaseState from "./state/ISearchFilterBaseState";
import * as _ from "lodash";

import { ISearchCategoryModel } from "./model/types/ISearchCategoryModel";
import {ISearchBaseModel} from "./model/types/ISearchBaseModel";
import SelectFilter from "../search_filter/SelectFilter";


export default class SearchBase extends React.Component<
  ISearchFilterBaseProps,
  ISearchFilterBaseState
> {
  private searchRef = React.createRef<HTMLDivElement>();

  

  public render() {
  
    
    const jsx = (
      <SelectFilter
        SearchTypeSelect={this.props.SearchTypeSelect}
        searchTypes={this.props.searchTypes}
        defaultValue={this.props.defaultSearchType}
      />
    );

    const { value, results, resultCategory, load } = this.state;
    
    
    const placeHolder = this.props.placeholder;
    const map: { [key: string]: ISearchCategoryModel } = {};

    if (resultCategory && resultCategory.length > 0) {
      resultCategory.map(r => {
        map[r.name] = r;
      });
    }





    const resultLocal = this.props.isCategory ? map : results;
    
    return (
      <div ref={this.searchRef}>
        <Search
          category={this.props.isCategory}
          loading={load || this.props.loading}
          size="large"
          onSearchChange={
            this.props.isCategory
              ? this.handleSearchChangeCategory
              : this.handleSearchChange
          }
          
          onResultSelect={this.handleResultSelect}
          results={resultLocal}
          value={value}
          fluid={true}
          onFocus={this.resetComponent}
          input={{
            action: jsx,
            className: "",
            icon: "search",
            iconPosition: "left",
            placeholder: placeHolder,
            fluid: true
          }}
          noResultsMessage={this.props.messageNotFound}
        />
      </div>
    );
  }

  public componentDidMount() {
    const refDiv = this.searchRef.current;
    if (refDiv) {
      const inputs = refDiv.getElementsByTagName("input");
      if (inputs) {
        const input = inputs.item(0);
        if (input) {
          input.classList.remove("prompt");
        }
      }
    }
    
  }

  public componentWillMount() {
    this.resetComponent();
  }

  private handleResultSelect = (
    e: React.SyntheticEvent<Element>,
    data: SearchResultData
  ) => {

    if (e == null) console.log(e);
    
    this.setState({...this.state, value: data.result.title });

    console.log(data.result);
    // tslint:disable-next-line:no-unused-expression
    this.props.elementSelected && this.props.elementSelected(data.result as ISearchBaseModel);
    
  };

  private handleSearchChange = (
    e: React.SyntheticEvent<Element>,    
    data: SearchProps
  ) => {

    if (e == null) console.log(e);    
    const value = data.value;
    this.setState({ load: true, value });

    const re = new RegExp(_.escapeRegExp(this.state.value), "i");
    const isMatch = (result: ISearchBaseModel) => re.test(result.title);

    

    const results = _.filter(this.props.source, isMatch);
    

    this.setState({
      load: false,
      results
    });
  };

  private handleSearchChangeCategory = (
    e: React.SyntheticEvent<Element>,
    data: SearchProps
  ) => {

    if (e == null) console.log(e);


    const value = data.value;

    this.setState({ load: true, value });



    const re = new RegExp(_.escapeRegExp(value), "i");

    const isMatch = (result: ISearchBaseModel) => {
      result.title;
      return re.test(result.title);
    }

    
    const filteredResults = _.reduce(
      this.props.sourceCategory,

      // tslint:disable-next-line:no-shadowed-variable
      (memo, data, index) => {

        
        const resultCategory = re.test(data.name);


        const result = _.filter(data.results, isMatch);
        

        const ElemResult = {
          name: data.name,
          results: resultCategory ? data.results : result
        };

        if (index === 0 && ElemResult.results.length > 0) {
          memo = ElemResult;
          return memo;
        }

        if (ElemResult.results.length === 0) {
          if(_.isEmpty(memo)){
            return [];
          }
          
          const memos = [...(memo as ISearchCategoryModel[])];

          
          if (index === 0) {
            return [];
          }
          return memos;
        } else {
          const memos = [...(memo as ISearchCategoryModel[]), ElemResult];

          return memos;
        }
      },
      {}
    ) as ISearchCategoryModel[];

    
    this.setState({
      load: false,
      resultCategory: filteredResults.length == undefined?[filteredResults as unknown as  ISearchCategoryModel] as ISearchCategoryModel[]:filteredResults 
    });
  };

  private resetComponent = (): void => {
    this.setState({ load: false, results: [], resultCategory: [], value: "" });
  };
}