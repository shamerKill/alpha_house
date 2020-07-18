import { StyleSheet } from 'react-native';
import {
  defaultThemeBgColor,
  defaultThemeColor, themeWhite, themeBlack, themeGray,
} from '../../config/theme';


const homeStyle = StyleSheet.create({
  homeView: {
    backgroundColor: themeWhite,
    flex: 1,
  },
  homeViewInner: {
    paddingLeft: 10,
    paddingRight: 10,
  },
  homeHead: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    marginRight: -10,
  },
  homeHeadText: {
    flex: 8,
    fontWeight: 'bold',
    fontSize: 20,
    lineHeight: 40,
    color: themeBlack,
  },
  homeHeadSearch: {
    width: 24,
    height: 24,
    margin: 10,
  },
  homeHeadComments: {
    width: 24,
    height: 24,
    margin: 10,
  },
  banner: {
    height: 160,
  },
  bannerSlide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerSlideImage: {
    width: '100%',
    flex: 1,
  },
  bannerSlideBottom: {
    bottom: 8,
  },
  bannerSlideBottomDotStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 5,
    marginRight: 5,
  },
  bannerSlideBottomActiveDotStyle: {
    backgroundColor: defaultThemeColor,
    marginLeft: 5,
    marginRight: 5,
  },
  commentView: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  commentSwiper: {
    flex: 1,
  },
  commentText: {
    height: 40,
    lineHeight: 40,
    fontSize: 14,
    overflow: 'hidden',
  },
  commentShadow: {
    width: 90,
    height: 40,
    marginLeft: -90,
  },
  marketSwiper: {
    marginTop: 10,
    marginBottom: 10,
    height: 100,
    marginLeft: -10,
    position: 'relative',
  },
  marketScroll: {
    flexDirection: 'row',
  },
  marketSwiperPug: {
    height: 3,
    backgroundColor: '#e9eaef',
    position: 'absolute',
    bottom: 5,
    left: '50%',
    marginLeft: -45,
  },
  marketSwiperDot: {
    height: 3,
    backgroundColor: themeGray,
  },
  marketBlock: {
    width: 120,
  },
  marketBlockKey: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
  },
  marketBlockPrice: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 30,
  },
  marketBlockRange: {
    textAlign: 'center',
  },
  marketBlockType: {
    textAlign: 'center',
    color: themeGray,
    fontSize: 12,
  },
  navListView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  navListViewBtns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  navListLi: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    borderRadius: 10,
  },
  navListImage: {
    width: 40,
    height: 40,
    alignSelf: 'center',
  },
  navListText: {
    fontSize: 13,
    color: themeBlack,
    paddingTop: 5,
    textAlign: 'center',
  },
  navBtnView: {
    width: 160,
    height: 50,
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  navBtnBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  navBtnImage: {
    width: 20,
    height: 20,
    marginLeft: 20,
    marginRight: 20,
  },
  navBtnText: {
    fontSize: 15,
    lineHeight: 30,
  },
  navBtnAdv: {
    width: '100%',
    marginTop: -20,
    marginBottom: -20,
  },
  marketViewHead: {
    borderBottomColor: defaultThemeBgColor,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: 5,
    height: 50,
  },
  marketViewHeadLeftText: {
    lineHeight: 50,
    color: themeGray,
    marginLeft: 10,
    marginRight: 10,
    fontSize: 14,
  },
  marketViewHeadLeftTextSelect: {
    lineHeight: 50,
    marginLeft: 10,
    marginRight: 10,
    color: themeBlack,
    fontSize: 20,
    fontWeight: 'bold',
  },
  marketViewHeadRightText: {
    lineHeight: 50,
    color: themeGray,
    fontSize: 12,
    paddingLeft: 5,
    paddingRight: 5,
    width: 40,
    textAlign: 'center',
  },
  marketViewHeadRightTextSelect: {
    lineHeight: 50,
    color: defaultThemeColor,
    textAlign: 'center',
    fontSize: 12,
    paddingLeft: 5,
    paddingRight: 5,
    fontWeight: 'bold',
  },
  marketViewListHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 10,
    paddingRight: 10,
    height: 30,
  },
  marketViewListHeadText: {
    lineHeight: 30,
    color: themeGray,
    fontSize: 12,
  },
  marketViewList: {
    borderBottomColor: defaultThemeBgColor,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
  },
});

export default homeStyle;
