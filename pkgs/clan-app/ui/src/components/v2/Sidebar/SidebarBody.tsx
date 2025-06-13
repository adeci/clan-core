import "./SidebarBody.css"
import { A } from "@solidjs/router";
import { Accordion } from "@kobalte/core/accordion";
import Icon from "../Icon/Icon";

export interface SidebarBodyProps {

}

export const SidebarBody = (props: SidebarBodyProps) => {

  return (
    <div class="sidebar-body">
      <nav>
        <Accordion class="accordion" multiple>
          <Accordion.Item class="item" value="foo">
            <Accordion.Header class="header">
              <Accordion.Trigger class="trigger">
                <span>Foo</span>
                <Icon icon="CaretDown" inverted={true}/>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content class="content">
              <A href="/foo">Foo</A>
              <A href="/foo">Bar</A>
              <A href="/foo">baz</A>
            </Accordion.Content>
          </Accordion.Item>
          <Accordion.Item class="item" value="bar">
            <Accordion.Header class="header">
              <Accordion.Trigger class="trigger">
                <span>Foo</span>
                <Icon icon="CaretDown" inverted={true}/>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content class="content">
              <A href="/foo">Foo</A>
              <A href="/foo">Bar</A>
              <A href="/foo">baz</A>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion>

      </nav>

    </div>
  )
}
