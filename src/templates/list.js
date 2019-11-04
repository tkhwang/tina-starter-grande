import React, { useEffect, useMemo } from "react"
import { graphql } from "gatsby"
import styled from "styled-components"
import {
  Paper,
  Headline,
  Hero,
  Wrapper,
  Overlay,
  Meta,
  MetaSpan,
  MetaActions,
  DraftBadge,
  LinkButton,
  Textline,
  Actions,
  HeroBackground,
} from "../components/style"
import { Authors } from "../components/authors"
import { SEO } from "../components/seo"
import { Link } from "gatsby"
import { Context } from "../components/context"
import { removeNull } from "../components/helpers"

import { useJsonForm } from "gatsby-tinacms-json"

const merge = require("lodash.merge")

export default function List({ data, pageContext }) {
  const [page] = useJsonForm(data.page, ListForm)
  const [authors] = useJsonForm(data.authors, AuthorsForm)

  const siteContext = React.useContext(Context)
  const theme = siteContext.theme
  const hero = merge({}, theme.hero, page.hero)

  const { slug, limit, skip, numPages, currentPage } = pageContext
  const isFirst = currentPage === 1
  const pageTitle = isFirst ? page.title : page.title + " - " + currentPage
  const isLast = currentPage === numPages
  const prevPage =
    currentPage - 1 === 1 ? slug : slug + "/" + (currentPage - 1).toString()
  const nextPage = slug + "/" + (currentPage + 1).toString()

  return (
    <Context.Consumer>
      {({ theme }) => (
        <>
          <SEO title={page.title} />
          <Hero large={hero.large}>
            <Wrapper>
              {hero.headline && <Headline>{hero.headline}</Headline>}
              {hero.textline && <Textline>{hero.textline}</Textline>}
              {hero.ctas && hero.ctas.length > 0 && (
                <Actions>
                  {hero.ctas.map(cta => {
                    return (
                      <LinkButton primary={cta.primary} to={cta.link}>
                        {cta.label}
                      </LinkButton>
                    )
                  })}
                </Actions>
              )}
            </Wrapper>
            {hero.overlay && <Overlay />}
            {hero.image && (
              <HeroBackground
                fluid={hero.image.childImageSharp.fluid}
              ></HeroBackground>
            )}
          </Hero>
          <Wrapper>
            {data.posts &&
              data.posts.edges.map(item => {
                return (
                  <Paper article key={item.node.id}>
                    {item.node.frontmatter.draft && (
                      <DraftBadge>Draft</DraftBadge>
                    )}
                    <h2>
                      <Link to={item.node.frontmatter.path}>
                        {item.node.frontmatter.title}
                      </Link>
                    </h2>
                    <p>{item.node.excerpt}</p>
                    <Meta>
                      <MetaSpan>{item.node.frontmatter.date}</MetaSpan>
                      {item.node.frontmatter.authors && (
                        <MetaSpan>
                          <em>By</em>&nbsp;
                          <Authors
                            authorSlugs={item.node.frontmatter.authors}
                          />
                        </MetaSpan>
                      )}
                      <MetaActions>
                        <Link to={item.node.frontmatter.path}>
                          Read Article →
                        </Link>
                      </MetaActions>
                    </Meta>
                  </Paper>
                )
              })}
            <ListNav>
              {!isFirst && (
                <Link to={prevPage} rel="prev">
                  ← Newer
                </Link>
              )}
              {!isLast && (
                <Link to={nextPage} rel="next">
                  Older →
                </Link>
              )}
            </ListNav>
          </Wrapper>
        </>
      )}
    </Context.Consumer>
  )
}

export const pageQuery = graphql`
  query($listType: String!, $slug: String!, $skip: Int!, $limit: Int!) {
    page: pagesJson(path: { eq: $slug }) {
      path
      title
      hero {
        headline
        textline
        large
        overlay
        image {
          childImageSharp {
            fluid(quality: 70, maxWidth: 1920) {
              ...GatsbyImageSharpFluid_withWebp
            }
          }
        }
      }
      listType
      rawJson
      fileRelativePath
    }
    posts: allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date] }
      filter: {
        frontmatter: { type: { eq: $listType } }
        published: { eq: true }
      }
      limit: $limit
      skip: $skip
    ) {
      edges {
        node {
          id
          excerpt
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            path
            title
            draft
            authors
          }
        }
      }
    }
    authors: dataJson(fileRelativePath: { eq: "/data/authors.json" }) {
      authors {
        slug
        name
        email
        link
      }

      rawJson
      fileRelativePath
    }
  }
`

export const ListNav = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;

  a {
    display: inline-block;
    padding: 0.5rem 1rem;
  }
`

const ListForm = {
  label: "Page",
  fields: [
    {
      label: "Title",
      name: "rawJson.title",
      component: "text",
    },
    {
      label: "Hero",
      name: "rawJson.hero",
      component: "group",
      fields: [
        {
          label: "Large",
          name: "large",
          component: "toggle",
        },
        {
          label: "Overlay",
          name: "overlay",
          component: "toggle",
        },
        {
          label: "Headline",
          name: "headline",
          component: "text",
        },
        {
          label: "Textline",
          name: "textline",
          component: "text",
        },
        {
          label: "Image",
          name: "image",
          component: "text",
        },
      ],
    },
    {
      label: "Page Theme",
      name: "rawJson.pageTheme",
      component: "group",
      fields: [
        {
          label: "Uppercase H2",
          name: "typography.uppercaseH2",
          component: "toggle",
        },
        {
          label: "Page Title",
          name: "page.displayTitle",
          component: "toggle",
        },
        {
          label: "Default Hero Image",
          name: "page.heroImage",
          component: "text",
        },
      ],
    },
  ],
}

const AuthorsForm = {
  label: "Authors",
  fields: [
    {
      label: "Authors",
      name: "rawJson.authors",
      component: "group-list",
      itemProps: item => ({
        key: item.slug,
        label: item.name,
      }),
      fields: [
        {
          label: "Name",
          name: "name",
          component: "text",
        },
        {
          label: "Slug",
          name: "slug",
          component: "text",
        },
        {
          label: "Email",
          name: "email",
          component: "text",
        },
        {
          label: "Link",
          name: "link",
          component: "text",
        },
      ],
    },
  ],
}
